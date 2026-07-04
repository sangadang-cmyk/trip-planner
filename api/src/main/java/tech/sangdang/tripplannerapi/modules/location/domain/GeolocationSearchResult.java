package tech.sangdang.tripplannerapi.modules.location.domain;

public record GeolocationSearchResult(
    Long id, String name, String addressType, Double latitude, Double longitude) {}
