package tech.sangdang.tripplannerapi.modules.trip.app.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.openapitools.model.CreateTripDestinationRequest;
import org.openapitools.model.CreateTripRequest;
import org.openapitools.model.TripDestinationResponse;
import org.openapitools.model.TripResponse;
import org.openapitools.model.UpdateTripDestinationRequest;
import org.openapitools.model.UpdateTripRequest;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.BadRequestException;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationRepository;
import tech.sangdang.tripplannerapi.modules.trip.app.TripManagementService;
import tech.sangdang.tripplannerapi.modules.trip.app.mapper.TripDestinationMapper;
import tech.sangdang.tripplannerapi.modules.trip.app.mapper.TripMapper;
import tech.sangdang.tripplannerapi.modules.trip.app.utils.TripDestinationVisitDates;
import tech.sangdang.tripplannerapi.modules.trip.app.utils.TripThumbnailResolver;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripDestinationEntity;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripEntity;
import tech.sangdang.tripplannerapi.modules.trip.domain.repository.TripDestinationRepository;
import tech.sangdang.tripplannerapi.modules.trip.domain.repository.TripRepository;

@Service
@RequiredArgsConstructor
public class TripManagementServiceImpl implements TripManagementService {
  private final TripRepository tripRepository;
  private final TripDestinationRepository tripDestinationRepository;
  private final LocationRepository locationRepository;
  private final TripMapper tripMapper;
  private final TripDestinationMapper tripDestinationMapper;
  private final TripThumbnailResolver tripThumbnailResolver;

  @Override
  public List<TripResponse> getTrips(UUID userId) {
    List<TripEntity> trips = tripRepository.findByUserIdOrderByCreatedAtDesc(userId);
    if (trips.isEmpty()) {
      return List.of();
    }

    List<UUID> tripIds = trips.stream().map(TripEntity::getId).toList();
    Map<UUID, String> thumbnailsByTripId = tripThumbnailResolver.resolveThumbnailsByTripId(tripIds);

    return trips.stream()
        .map(trip -> tripMapper.toResponse(trip, thumbnailsByTripId.get(trip.getId())))
        .toList();
  }

  @Override
  public TripResponse getTripById(UUID tripId, UUID userId) {
    TripEntity trip =
        tripRepository
            .findByIdAndUserId(tripId, userId)
            .orElseThrow(() -> new NotFoundException("Trip not found"));
    return tripMapper.toResponse(trip);
  }

  @Override
  public TripResponse updateTrip(UUID tripId, UpdateTripRequest request, UUID userId) {
    TripEntity trip =
        tripRepository
            .findByIdAndUserId(tripId, userId)
            .orElseThrow(() -> new NotFoundException("Trip not found"));

    if (request.getName() != null) {
      trip.setName(request.getName());
    }
    if (request.getStartDate() != null) {
      trip.setStartDate(request.getStartDate());
    }
    if (request.getEndDate() != null) {
      trip.setEndDate(request.getEndDate());
    }
    if (request.getNotes() != null) {
      trip.setNotes(request.getNotes());
    }

    if (trip.getEndDate().isBefore(trip.getStartDate())) {
      throw new BadRequestException("End date must be on or after start date");
    }

    return tripMapper.toResponse(tripRepository.save(trip));
  }

  @Override
  public List<TripDestinationResponse> getTripDestinations(UUID tripId, UUID userId) {
    if (tripRepository.findByIdAndUserId(tripId, userId).isEmpty()) {
      throw new NotFoundException("Trip not found");
    }
    return tripDestinationRepository.findActiveByTripIdOrdered(tripId).stream()
        .map(tripDestinationMapper::toResponse)
        .toList();
  }

  @Override
  public TripDestinationResponse createTripDestination(
      UUID tripId, CreateTripDestinationRequest request, UUID userId) {
    TripEntity trip =
        tripRepository
            .findByIdAndUserId(tripId, userId)
            .orElseThrow(() -> new NotFoundException("Trip not found"));

    TripDestinationVisitDates.validateVisitDate(
        unwrapVisitDate(request.getVisitDate()), trip.getStartDate(), trip.getEndDate());

    LocationEntity location =
        locationRepository
            .findById(request.getLocationId())
            .orElseThrow(() -> new NotFoundException("Location not found"));

    Optional<TripDestinationEntity> existingDestination =
        tripDestinationRepository.findByTrip_IdAndLocation_Id(tripId, request.getLocationId());

    if (existingDestination.isPresent()) {
      TripDestinationEntity destination = existingDestination.get();
      if (destination.getDeletedDate() == null) {
        throw new BadRequestException("This location is already added to the trip");
      }

      destination.setDeletedDate(null);
      destination.setVisitDate(unwrapVisitDate(request.getVisitDate()));
      destination.setSortOrder(request.getSortOrder());
      destination.setNotes(request.getNotes());
      return tripDestinationMapper.toResponse(tripDestinationRepository.save(destination));
    }

    TripDestinationEntity destination =
        TripDestinationEntity.builder()
            .trip(trip)
            .location(location)
            .visitDate(unwrapVisitDate(request.getVisitDate()))
            .sortOrder(request.getSortOrder())
            .notes(request.getNotes())
            .build();

    return tripDestinationMapper.toResponse(tripDestinationRepository.save(destination));
  }

  @Override
  public TripDestinationResponse updateTripDestination(
      UUID tripId,
      UUID destinationId,
      UpdateTripDestinationRequest request,
      UUID userId) {
    if (tripRepository.findByIdAndUserId(tripId, userId).isEmpty()) {
      throw new NotFoundException("Trip not found");
    }

    TripDestinationEntity destination =
        tripDestinationRepository
            .findByIdAndTrip_IdAndDeletedDateIsNull(destinationId, tripId)
            .orElseThrow(() -> new NotFoundException("Trip destination not found"));

    if (request.getVisitDate() != null) {
      if (request.getVisitDate().isPresent()) {
        TripDestinationVisitDates.validateVisitDate(
            request.getVisitDate().get(),
            destination.getTrip().getStartDate(),
            destination.getTrip().getEndDate());
        destination.setVisitDate(request.getVisitDate().get());
      } else {
        destination.setVisitDate(null);
      }
    }
    if (request.getSortOrder() != null) {
      destination.setSortOrder(request.getSortOrder());
    }
    if (request.getNotes() != null) {
      destination.setNotes(request.getNotes());
    }

    return tripDestinationMapper.toResponse(tripDestinationRepository.save(destination));
  }

  @Override
  public void deleteTripDestination(UUID tripId, UUID destinationId, UUID userId) {
    if (tripRepository.findByIdAndUserId(tripId, userId).isEmpty()) {
      throw new NotFoundException("Trip not found");
    }

    TripDestinationEntity destination =
        tripDestinationRepository
            .findByIdAndTrip_IdAndDeletedDateIsNull(destinationId, tripId)
            .orElseThrow(() -> new NotFoundException("Trip destination not found"));

    destination.setDeletedDate(LocalDateTime.now(ZoneOffset.UTC));
    tripDestinationRepository.save(destination);
  }

  @Override
  public List<UUID> getTripIdsByLocationId(UUID locationId, UUID userId) {
    return tripDestinationRepository.findTripIdsByLocationIdAndUserId(locationId, userId);
  }

  @Override
  public TripResponse createTrip(CreateTripRequest request, UUID userId) {
    if (request.getEndDate().isBefore(request.getStartDate())) {
      throw new BadRequestException("End date must be on or after start date");
    }

    TripEntity trip =
        TripEntity.builder()
            .userId(userId)
            .name(request.getName())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .notes(request.getNotes())
            .build();

    return tripMapper.toResponse(tripRepository.save(trip));
  }

  private static LocalDate unwrapVisitDate(JsonNullable<LocalDate> visitDate) {
    if (visitDate == null || !visitDate.isPresent()) {
      return null;
    }

    return visitDate.get();
  }
}
