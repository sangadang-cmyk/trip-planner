package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.openapitools.model.CityResponse;
import org.openapitools.model.CountryResponse;
import org.openapitools.model.CreateCityRequest;
import org.openapitools.model.CreateCountryRequest;
import org.openapitools.model.PaginatedCitiesResponse;
import org.openapitools.model.PaginatedCountriesResponse;
import org.openapitools.model.UpdateCityRequest;
import org.openapitools.model.UpdateCountryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationManagementService;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.CountryEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CityRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CountryRepository;

@Service
@RequiredArgsConstructor
public class GeolocationManagementServiceImpl implements GeolocationManagementService {
  private final CountryRepository countryRepository;
  private final CityRepository cityRepository;

  @Override
  public PaginatedCountriesResponse getCountries(int page, int size) {
    Page<CountryEntity> countryPage = countryRepository.findAll(PageRequest.of(page, size));

    return PaginatedCountriesResponse.builder()
        .content(countryPage.getContent().stream().map(this::toCountryResponse).toList())
        .page(countryPage.getNumber())
        .size(countryPage.getSize())
        .totalElements(countryPage.getTotalElements())
        .totalPages(countryPage.getTotalPages())
        .build();
  }

  @Override
  public CountryResponse createCountry(CreateCountryRequest request) {
    CountryEntity country =
        CountryEntity.builder()
            .name(request.getName())
            .code(request.getCode())
            .aliases(toAliasArray(request.getAliases()))
            .build();

    return toCountryResponse(countryRepository.save(country));
  }

  @Override
  public CountryResponse getCountryById(UUID id) {
    return toCountryResponse(findCountryOrThrow(id));
  }

  @Override
  public CountryResponse updateCountry(UUID id, UpdateCountryRequest request) {
    CountryEntity country = findCountryOrThrow(id);

    if (request.getName() != null) {
      country.setName(request.getName());
    }
    if (request.getCode() != null) {
      country.setCode(request.getCode());
    }
    if (!request.getAliases().isEmpty()) {
      country.setAliases(request.getAliases().toArray(String[]::new));
    }

    return toCountryResponse(countryRepository.save(country));
  }

  @Override
  public PaginatedCitiesResponse getCities(int page, int size, @Nullable UUID countryId) {
    Page<CityEntity> cityPage =
        countryId == null
            ? cityRepository.findAll(PageRequest.of(page, size))
            : cityRepository.findByCountryId(countryId, PageRequest.of(page, size));

    return PaginatedCitiesResponse.builder()
        .content(cityPage.getContent().stream().map(this::toCityResponse).toList())
        .page(cityPage.getNumber())
        .size(cityPage.getSize())
        .totalElements(cityPage.getTotalElements())
        .totalPages(cityPage.getTotalPages())
        .build();
  }

  @Override
  public CityResponse createCity(CreateCityRequest request) {
    if (!countryRepository.existsById(request.getCountryId())) {
      throw new NotFoundException("Country not found");
    }

    CityEntity city =
        CityEntity.builder()
            .name(request.getName())
            .countryId(request.getCountryId())
            .aliases(toAliasArray(request.getAliases()))
            .build();

    return toCityResponse(cityRepository.save(city));
  }

  @Override
  public CityResponse getCityById(UUID id) {
    return toCityResponse(findCityOrThrow(id));
  }

  @Override
  public CityResponse updateCity(UUID id, UpdateCityRequest request) {
    CityEntity city = findCityOrThrow(id);

    if (request.getName() != null) {
      city.setName(request.getName());
    }
    if (request.getCountryId() != null) {
      if (!countryRepository.existsById(request.getCountryId())) {
        throw new NotFoundException("Country not found");
      }
      city.setCountryId(request.getCountryId());
    }
    if (!request.getAliases().isEmpty()) {
      city.setAliases(request.getAliases().toArray(String[]::new));
    }

    return toCityResponse(cityRepository.save(city));
  }

  private CountryEntity findCountryOrThrow(UUID id) {
    return countryRepository
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Country not found"));
  }

  private CityEntity findCityOrThrow(UUID id) {
    return cityRepository
        .findById(id)
        .orElseThrow(() -> new NotFoundException("City not found"));
  }

  private CountryResponse toCountryResponse(CountryEntity country) {
    return CountryResponse.builder()
        .id(country.getId())
        .name(country.getName())
        .code(country.getCode())
        .aliases(toAliasList(country.getAliases()))
        .build();
  }

  private CityResponse toCityResponse(CityEntity city) {
    return CityResponse.builder()
        .id(city.getId())
        .name(city.getName())
        .countryId(city.getCountryId())
        .aliases(toAliasList(city.getAliases()))
        .build();
  }

  private List<String> toAliasList(String[] aliases) {
    return aliases == null ? List.of() : Arrays.asList(aliases);
  }

  private String[] toAliasArray(List<String> aliases) {
    if (aliases == null || aliases.isEmpty()) {
      return new String[0];
    }
    return aliases.toArray(String[]::new);
  }
}
