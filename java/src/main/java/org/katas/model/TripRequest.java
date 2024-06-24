package org.katas.model;

import java.util.List;

public record TripRequest(TripDetails details, List<Passenger> passengers) {
}
