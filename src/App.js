import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";

const CreditCardDropdown = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [filteredCreditCards, setFilteredCreditCards] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [pvrOffers, setPvrOffers] = useState([]);
  const [inoxOffers, setInoxOffers] = useState([]);
  const [bookMyShowOffers, setBookMyShowOffers] = useState([]);
  const [noOffersMessage, setNoOffersMessage] = useState(false);

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const files = [
          { name: "Pvr final.csv", setter: setPvrOffers },
          { name: "Inox final.csv", setter: setInoxOffers },
          { name: "Book My Show final.csv", setter: setBookMyShowOffers },
        ];

        let allCreditCards = new Set();

        for (let file of files) {
          const response = await axios.get(`/${file.name}`);
          const parsedData = Papa.parse(response.data, { header: true });

          parsedData.data.forEach((row) => {
            if (row["Credit Card"]) {
              allCreditCards.add(row["Credit Card"].trim());
            }
          });

          file.setter(parsedData.data);
        }

        setCreditCards(Array.from(allCreditCards).sort());
        setFilteredCreditCards(Array.from(allCreditCards).sort());
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

      if (!filtered.includes(value.trim())) {
        setNoOffersMessage(true);
        setSelectedCard("");
      } else {
        setNoOffersMessage(false);
      }
    } else {
      setFilteredCreditCards([]);
      setNoOffersMessage(false);
      setSelectedCard("");
    }
  };

  const handleCardSelection = (card) => {
    setSelectedCard(card);
    setQuery(card);
    setFilteredCreditCards([]);
    setNoOffersMessage(false);
  };

  const getOffersForSelectedCard = (offers) => {
    return offers.filter(
      (offer) => offer["Credit Card"] && offer["Credit Card"].trim() === selectedCard
    );
  };

  const selectedPvrOffers = getOffersForSelectedCard(pvrOffers);
  const selectedInoxOffers = getOffersForSelectedCard(inoxOffers);
  const selectedBookMyShowOffers = getOffersForSelectedCard(bookMyShowOffers);

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
          {selectedPvrOffers.length > 0 && (
            <div className="offer-container">
              <h2>PVR Offers</h2>
              {selectedPvrOffers.map((offer, index) => (
                <p key={index}>{offer["Offer Details"]}</p>
              ))}
            </div>
          )}
          {selectedInoxOffers.length > 0 && (
            <div className="offer-container">
              <h2>Inox Offers</h2>
              {selectedInoxOffers.map((offer, index) => (
                <p key={index}>{offer["Offer Details"]}</p>
              ))}
            </div>
          )}
          {selectedBookMyShowOffers.length > 0 && (
            <div className="offer-container">
              <h2>Book My Show Offers</h2>
              {selectedBookMyShowOffers.map((offer, index) => (
                <p key={index}>{offer["Offer Details"]}</p>
              ))}
            </div>
          )}
        </div>
      ) : noOffersMessage ? (
        <p className="no-offers">No offers applicable at the moment</p>
      ) : null}
    </div>
  );
};

export default CreditCardDropdown;
