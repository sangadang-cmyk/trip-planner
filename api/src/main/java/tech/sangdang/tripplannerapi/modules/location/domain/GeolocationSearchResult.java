package tech.sangdang.tripplannerapi.modules.location.domain;

public record GeolocationSearchResult(
    Long osmId,
    String osmType,
    String name,
    String addressType,
    Double latitude,
    Double longitude) {}
