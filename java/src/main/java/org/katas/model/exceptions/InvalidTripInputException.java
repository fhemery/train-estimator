package org.katas.model.exceptions;

public class InvalidTripInputException extends RuntimeException {
    public InvalidTripInputException(String message) {
        super(message);
    }
}
