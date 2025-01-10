import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./App.css";

const CreditCardDropdown = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [filteredCreditCards, setFilteredCreditCards] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [offers, setOffers] = useState([]);
  const [noOffersMessage, setNoOffersMessage] = useState(false);

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await axios.get("/offers.csv");
        const parsedData = Papa.parse(response.data, { header: true });

        const creditCardsSet = new Set();
        parsedData.data.forEach((row) => {
          if (row["Credit Card"]) {
            creditCardsSet.add(row["Credit Card"].trim());
          }
        });

        setCreditCards(Array.from(creditCardsSet).sort());
        setOffers(parsedData.data);
      } catch (error) {
        console.error("Error loading CSV data:", error);
      }
    };

    fetchCSVData();
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value) {
      const filtered = creditCards.filter((card) =>
        card.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredCreditCards(filtered);

      if (filtered.includes(value.trim())) {
        setNoOffersMessage(false);
        setSelectedCard(value.trim());
      } else {
        setNoOffersMessage(true);
        setSelectedCard("");
      }
    } else {
      setFilteredCreditCards([]);
      setNoOffersMessage(false);
      setSelectedCard("");
    }
  };

  const handleCardSelection = (card) => {
    setQuery(card);
    setSelectedCard(card);
    setFilteredCreditCards([]);
    setNoOffersMessage(false);
  };

  const selectedOffers = offers.filter(
    (offer) => offer["Credit Card"] === selectedCard
  );

  return (
    <div className="App">
      <h1>Movies Offers - Linked to your Credit Card</h1>
      <div className="creditCardDropdown">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Type a Credit Card..."
        />
        {filteredCreditCards.length > 0 && (
          <ul>
            {filteredCreditCards.map((card, index) => (
              <li key={index} onClick={() => handleCardSelection(card)}>
                {card}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Display Offers */}
      {selectedCard ? (
        <div className="offer-section">
          {selectedOffers.length > 0 ? (
            <div className="offer-container">
              <h2>Offers for {selectedCard}</h2>
              {selectedOffers.map((offer, index) => (
                <p key={index}>{offer["Offer Details"]}</p>
              ))}
            </div>
          ) : (
            <p className="no-offers">No offers available for {selectedCard}</p>
          )}
        </div>
      ) : noOffersMessage ? (
        <p className="no-offers">No offers applicable at the moment</p>
      ) : null}
    </div>
  );
};

export default CreditCardDropdown;
