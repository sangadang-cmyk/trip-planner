resource "aws_s3_bucket" "image-storage" {
  bucket = "${var.environment}-image-storage"
}