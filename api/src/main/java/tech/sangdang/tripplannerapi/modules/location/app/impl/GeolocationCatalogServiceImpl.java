package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationCatalogService;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.CountryEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CityRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CountryRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeolocationCatalogServiceImpl implements GeolocationCatalogService {
  private final CountryRepository countryRepository;
  private final CityRepository cityRepository;

  @Override
  @Transactional
  public void cacheSearchResults(List<GeolocationSearchResult> results) {
    for (GeolocationSearchResult result : results) {
      if (result.osmType() == null
          || result.osmType().isBlank()
          || result.osmId() == null
          || result.name() == null
          || result.name().isBlank()) {
        continue;
      }

      switch (result.addressType()) {
        case "country" -> upsertCountry(result);
        case "city" -> upsertCity(result);
        default -> log.trace("Skipping unsupported addressType={}", result.addressType());
      }
    }
  }

  private void upsertCountry(GeolocationSearchResult result) {
    countryRepository
        .findById(result.osmId())
        .ifPresentOrElse(
            existing -> updateCountryIfChanged(existing, result),
            () ->
                countryRepository.save(
                    CountryEntity.builder()
                        .osmId(result.osmId())
                        .osmType(result.osmType())
                        .name(result.name())
                        .build()));
  }

  private void upsertCity(GeolocationSearchResult result) {
    cityRepository
        .findById(result.osmId())
        .ifPresentOrElse(
            existing -> updateCityIfChanged(existing, result),
            () ->
                cityRepository.save(
                    CityEntity.builder()
                        .osmId(result.osmId())
                        .osmType(result.osmType())
                        .name(result.name())
                        .build()));
  }

  private void updateCountryIfChanged(CountryEntity country, GeolocationSearchResult result) {
    boolean changed = false;

    if (!result.name().equals(country.getName())) {
      country.setName(result.name());
      changed = true;
    }

    if (!Objects.equals(result.osmType(), country.getOsmType())) {
      country.setOsmType(result.osmType());
      changed = true;
    }

    if (changed) {
      countryRepository.save(country);
    }
  }

  private void updateCityIfChanged(CityEntity city, GeolocationSearchResult result) {
    boolean changed = false;

    if (!result.name().equals(city.getName())) {
      city.setName(result.name());
      changed = true;
    }

    if (!Objects.equals(result.osmType(), city.getOsmType())) {
      city.setOsmType(result.osmType());
      changed = true;
    }

    if (changed) {
      cityRepository.save(city);
    }
  }
}
