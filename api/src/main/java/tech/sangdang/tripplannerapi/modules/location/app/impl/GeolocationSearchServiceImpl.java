package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.GeolocationSearchResult;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.BadRequestException;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationSearchService;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.GeolocationSearchMapper;
import tech.sangdang.tripplannerapi.modules.location.domain.port.GeolocationSearchPort;

@Service
@RequiredArgsConstructor
public class GeolocationSearchServiceImpl implements GeolocationSearchService {
  private final GeolocationSearchPort geolocationSearchPort;
  private final GeolocationSearchMapper geolocationSearchMapper;

  @Override
  public List<GeolocationSearchResult> search(String query) {
    if (query == null || query.isBlank()) {
      throw new BadRequestException("Search query is required");
    }

    return geolocationSearchPort.searchCountriesAndCities(query.trim()).stream()
        .map(geolocationSearchMapper::toResponse)
        .toList();
  }
}
