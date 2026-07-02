package tech.sangdang.tripplannerapi.modules.trip.app.utils;

import tech.sangdang.tripplannerapi.common.core.BadRequestException;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripDestinationEntity;

public final class TripDestinationDayNumbers {
  private TripDestinationDayNumbers() {}

  public static int resolveDayNumber(Integer dayNumber) {
    if (dayNumber == null) {
      return TripDestinationEntity.UNSORTED_DAY_NUMBER;
    }

    validateDayNumber(dayNumber);
    return dayNumber;
  }

  public static void validateDayNumber(int dayNumber) {
    if (dayNumber != TripDestinationEntity.UNSORTED_DAY_NUMBER && dayNumber < 1) {
      throw new BadRequestException("Day number must be -1 (unsorted) or at least 1");
    }
  }
}
