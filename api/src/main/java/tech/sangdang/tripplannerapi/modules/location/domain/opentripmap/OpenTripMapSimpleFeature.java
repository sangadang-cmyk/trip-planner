package tech.sangdang.tripplannerapi.modules.location.domain.opentripmap;

public record OpenTripMapSimpleFeature(
    String xid,
    String name,
    String kinds,
    String osm,
    String wikidata,
    Double dist,
    OpenTripMapPoint point) {}
