package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.UUID;
import org.jspecify.annotations.Nullable;
import org.openapitools.model.CityResponse;
import org.openapitools.model.CountryResponse;
import org.openapitools.model.CreateCityRequest;
import org.openapitools.model.CreateCountryRequest;
import org.openapitools.model.PaginatedCitiesResponse;
import org.openapitools.model.PaginatedCountriesResponse;
import org.openapitools.model.UpdateCityRequest;
import org.openapitools.model.UpdateCountryRequest;

public interface GeolocationManagementService {
  PaginatedCountriesResponse getCountries(int page, int size);

  CountryResponse createCountry(CreateCountryRequest request);

  CountryResponse getCountryById(UUID id);

  CountryResponse updateCountry(UUID id, UpdateCountryRequest request);

  PaginatedCitiesResponse getCities(int page, int size, @Nullable UUID countryId);

  CityResponse createCity(CreateCityRequest request);

  CityResponse getCityById(UUID id);

  CityResponse updateCity(UUID id, UpdateCityRequest request);
}
