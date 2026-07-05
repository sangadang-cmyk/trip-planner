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
      port = 80
      protocol = "HTTP"
      forward = {
        target_group_key = "api"
      }
    }
  }

  target_groups = {
    api = {
      name = "${var.project}-${var.environment}-${var.region}-api-tg"
      port = 80
      protocol = "HTTP"
      target_type = "ip"
      vpc_id = module.vpc.vpc_id
    }
  }
}

# resource "aws_iam_role" "ecs-task-execution-role" {
#   assume_role_policy = ""
# }
#
# resource "aws_ecs_task_definition" "api" {
#   family = "${var.project}-${var.environment}-${var.region}-api"
#   container_definitions = file("task-definitions/api.json")
#   network_mode = "awsvpc"
# }
#
# module "ecs" {
#   source = "terraform-aws-modules/ecs/aws"
#
#   cluster_name = "${var.project}-${var.environment}-${var.region}-cluster"
#
#   cluster_capacity_providers = ["FARGATE"]
#   default_capacity_provider_strategy = {
#     FARGATE = {
#       weight = 50
#       base   = 20
#     }
#   }
#
#   services = {
#
#   }
# }
