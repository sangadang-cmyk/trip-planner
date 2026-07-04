package tech.sangdang.tripplannerapi.modules.location.infra.nominatim;

final class NominatimUtils {

  private NominatimUtils() {}

  static String formatOsmIds(String osmType, Long osmId) {
    if (osmType == null || osmType.isBlank()) {
      throw new IllegalArgumentException("OSM type is required");
    }

    if (osmId == null) {
      throw new IllegalArgumentException("OSM id is required");
    }

    char prefix =
        switch (osmType) {
          case "node" -> 'N';
          case "way" -> 'W';
          case "relation" -> 'R';
          default -> throw new IllegalArgumentException("Unsupported OSM type: " + osmType);
        };

    return prefix + String.valueOf(osmId);
  }
}
