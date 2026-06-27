package tech.sangdang.tripplannerapi.modules.location.api;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.openapitools.api.GeolocationManagementApi;
import org.openapitools.model.CityResponse;
import org.openapitools.model.CountryResponse;
import org.openapitools.model.CreateCityRequest;
import org.openapitools.model.CreateCountryRequest;
import org.openapitools.model.PaginatedCitiesResponse;
import org.openapitools.model.PaginatedCountriesResponse;
import org.openapitools.model.UpdateCityRequest;
import org.openapitools.model.UpdateCountryRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationManagementService;

@RestController
@RequiredArgsConstructor
public class GeolocationManagementController implements GeolocationManagementApi {
  private final GeolocationManagementService geolocationManagementService;

  @Override
  public ResponseEntity<PaginatedCountriesResponse> adminCountriesGet(Integer page, Integer size) {
    return ResponseEntity.ok(geolocationManagementService.getCountries(page, size));
  }

  @Override
  public ResponseEntity<CountryResponse> adminCountriesPost(
      CreateCountryRequest createCountryRequest) {
    CountryResponse response =
        geolocationManagementService.createCountry(createCountryRequest);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @Override
  public ResponseEntity<CountryResponse> adminCountriesIdGet(UUID id) {
    return ResponseEntity.ok(geolocationManagementService.getCountryById(id));
  }

  @Override
  public ResponseEntity<CountryResponse> adminCountriesIdPut(
      UUID id, UpdateCountryRequest updateCountryRequest) {
    return ResponseEntity.ok(
        geolocationManagementService.updateCountry(id, updateCountryRequest));
  }

  @Override
  public ResponseEntity<PaginatedCitiesResponse> adminCitiesGet(
      Integer page, Integer size, @Nullable UUID countryId) {
    return ResponseEntity.ok(geolocationManagementService.getCities(page, size, countryId));
  }

  @Override
  public ResponseEntity<CityResponse> adminCitiesPost(CreateCityRequest createCityRequest) {
    CityResponse response = geolocationManagementService.createCity(createCityRequest);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @Override
  public ResponseEntity<CityResponse> adminCitiesIdGet(UUID id) {
    return ResponseEntity.ok(geolocationManagementService.getCityById(id));
  }

  @Override
  public ResponseEntity<CityResponse> adminCitiesIdPut(UUID id, UpdateCityRequest updateCityRequest) {
    return ResponseEntity.ok(geolocationManagementService.updateCity(id, updateCityRequest));
  }
}
