package tech.sangdang.tripplannerapi.modules.location.domain;

public record FetchedLocationSummary(
    String sourceId, String name, Double latitude, Double longitude) {}
