package tech.sangdang.tripplannerapi.modules.location.domain;

public record FetchedLocationDetails(
    String imageUrl, String previewImageUrl, String kinds, String description, int popularity) {}
