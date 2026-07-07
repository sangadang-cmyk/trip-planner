module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.project}-${var.environment}-${var.region}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

module "alb-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "${var.project}-${var.environment}-${var.region}-alb-sg"
  description = "Security Group for the Trip Planner ALB"

  vpc_id = module.vpc.vpc_id

  ingress_rules = {
    http = {
      from_port   = 80
      ip_protocol = "tcp"
      description = "HTTP from Internet"
      cidr_ipv4   = "0.0.0.0/0"
    }
    https = {
      from_port   = 443
      ip_protocol = "tcp"
      description = "HTTPS from Internet"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  egress_rules = {
    all = {
      cidr_ipv4   = "0.0.0.0/0"
      ip_protocol = -1
    }
  }
}

module "alb" {
  source = "terraform-aws-modules/alb/aws"

  name    = "${var.project}-${var.environment}-${var.region}-alb"
  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets

  security_groups = [module.alb-sg.id]

  listeners = {
    http = {
      port     = 80
      protocol = "HTTP"
      forward = {
        target_group_key = "api"
      }
    }
  }

  additional_target_group_attachments = {}

  target_groups = {
    api = {
      name        = "${var.project}-${var.environment}-${var.region}-api-tg"
      port        = 80
      protocol    = "HTTP"
      target_type = "ip"
      vpc_id      = module.vpc.vpc_id
      create_attachment = false
    }
  }
}

module "ecr" {
  source = "terraform-aws-modules/ecr/aws"

  repository_name = "${var.project}-${var.environment}-${var.region}-api-ecr"

  repository_read_write_access_arns = [module.ecs_task_execution_role.arn]
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last 30 images",
        selection = {
          tagStatus     = "tagged",
          tagPrefixList = ["v"],
          countType     = "imageCountMoreThan",
          countNumber   = 30
        },
        action = {
          type = "expire"
        }
      }
    ]
  })
}

module "ecs_task_execution_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role"

  name = "${var.project}-${var.environment}-task-execution-role"

  trust_policy_permissions = {
    ECSTaskAssumeRole = {
      actions = ["sts:AssumeRole"]
      principals = [{
        type        = "Service"
        identifiers = ["ecs-tasks.amazonaws.com"]
      }]
    }
  }

  policies = {
    ECSTaskExecutionPolicy = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-${var.environment}-${var.region}-api"
  container_definitions    = file("task-definitions/api-containers.json")
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "3072"
  execution_role_arn       = module.ecs_task_execution_role.arn
}

resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${var.project}-${var.environment}-ecs-tasks-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [module.alb-sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "ecs" {
  source = "terraform-aws-modules/ecs/aws"

  cluster_name = "${var.project}-${var.environment}-${var.region}-cluster"

  cluster_capacity_providers = ["FARGATE"]

  # Services
  services = {
    api = {
      name                   = "${var.project}-${var.environment}-api"
      desired_count          = 1
      launch_type            = "FARGATE"
      create_task_definition = false
      container_definitions  = {}
      task_definition_arn    = aws_ecs_task_definition.api.arn

      # Network config
      assign_public_ip   = false
      subnet_ids         = module.vpc.private_subnets
      security_group_ids = [aws_security_group.ecs_tasks.id]

      # Load balancer
      load_balancer = {
        api = {
          target_group_arn = module.alb.target_groups["api"].arn
          container_name   = "trip-api"
          container_port   = 80
        }
      }

      # Task Execution role
      task_exec_iam_role_arn = module.ecs_task_execution_role.arn

      # Task role
      create_iam_role     = true
      iam_role_name       = "${var.project}-${var.environment}-task-role"
      iam_role_statements = []

      # CloudWatch logs in task def
      enable_cloudwatch_logging              = true
      create_cloudwatch_log_group            = true
      cloudwatch_log_group_name              = "/ecs/${var.project}-${var.environment}-api"
      cloudwatch_log_group_retention_in_days = 7
    }
  }
}
