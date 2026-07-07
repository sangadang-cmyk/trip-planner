package tech.sangdang.tripplannerapi.modules.trip.app.utils;

import java.time.LocalDate;
import tech.sangdang.tripplannerapi.common.core.BadRequestException;

public final class TripDestinationVisitDates {
  private TripDestinationVisitDates() {}

  public static void validateVisitDate(
      LocalDate visitDate, LocalDate tripStartDate, LocalDate tripEndDate) {
    if (visitDate == null) {
      return;
    }

    if (visitDate.isBefore(tripStartDate) || visitDate.isAfter(tripEndDate)) {
      throw new BadRequestException("Visit date must be within the trip dates");
    }
  }
}
