package tech.sangdang.tripplannerapi.modules.location.domain.port;

public interface GeolocationPolygonPort {
  String fetchPolygonGeoJson(String osmType, Long osmId);
}
