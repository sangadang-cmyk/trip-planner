package tech.sangdang.tripplannerapi.modules.location.domain;

public record GeolocationSearchResult(
    Long id,
    String osmType,
    Long osmId,
    String name,
    String addressType,
    Double latitude,
    Double longitude) {}
