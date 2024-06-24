package org.katas.model;

public enum DiscountCard
{
    Senior("Senior"),
    TrainStroke("TrainStroke"),
    Couple("Couple"),
    HalfCouple("HalfCouple");

    private final String card;

    DiscountCard(String card) {
        this.card = card;
    }

    String getCard() {
        return card;
    }

}
