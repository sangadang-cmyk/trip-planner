package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.List;
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
      if (result.id() == null || result.name() == null || result.name().isBlank()) {
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
        .findById(result.id())
        .ifPresentOrElse(
            existing -> updateNameIfChanged(existing, result.name()),
            () ->
                countryRepository.save(
                    CountryEntity.builder().id(result.id()).name(result.name()).build()));
  }

  private void upsertCity(GeolocationSearchResult result) {
    cityRepository
        .findById(result.id())
        .ifPresentOrElse(
            existing -> updateNameIfChanged(existing, result.name()),
            () -> cityRepository.save(CityEntity.builder().id(result.id()).name(result.name()).build()));
  }

  private void updateNameIfChanged(CountryEntity country, String name) {
    if (!name.equals(country.getName())) {
      country.setName(name);
      countryRepository.save(country);
    }
  }

  private void updateNameIfChanged(CityEntity city, String name) {
    if (!name.equals(city.getName())) {
      city.setName(name);
      cityRepository.save(city);
    }
  }
}
