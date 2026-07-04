package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.GeolocationSearchResult;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.BadRequestException;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationCatalogService;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationSearchService;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.GeolocationSearchMapper;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.CountryEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.port.GeolocationPolygonPort;
import tech.sangdang.tripplannerapi.modules.location.domain.port.GeolocationSearchPort;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CityRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CountryRepository;

@Service
@RequiredArgsConstructor
public class GeolocationSearchServiceImpl implements GeolocationSearchService {
  private final GeolocationSearchPort geolocationSearchPort;
  private final GeolocationPolygonPort geolocationPolygonPort;
  private final GeolocationCatalogService geolocationCatalogService;
  private final GeolocationSearchMapper geolocationSearchMapper;
  private final CountryRepository countryRepository;
  private final CityRepository cityRepository;

  @Override
  public List<GeolocationSearchResult> search(String query) {
    if (query == null || query.isBlank()) {
      throw new BadRequestException("Search query is required");
    }

    List<tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult> results =
        geolocationSearchPort.searchCountriesAndCities(query.trim());

    geolocationCatalogService.cacheSearchResults(results);

    return results.stream().map(geolocationSearchMapper::toResponse).toList();
  }

  @Override
  public String getPolygonGeoJson(Long osmId) {
    String osmType =
        countryRepository
            .findByOsmId(osmId)
            .map(CountryEntity::getOsmType)
            .or(() -> cityRepository.findByOsmId(osmId).map(CityEntity::getOsmType))
            .orElseThrow(() -> new NotFoundException("Geolocation place not found"));

    String polygonGeoJson = geolocationPolygonPort.fetchPolygonGeoJson(osmType, osmId);

    if (polygonGeoJson == null || polygonGeoJson.isBlank()) {
      throw new NotFoundException("Polygon GeoJSON not found");
    }

    return polygonGeoJson;
  }
}
