import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./App.css";

const CreditCardDropdown = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [filteredCreditCards, setFilteredCreditCards] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [pvrOffers, setPvrOffers] = useState([]);
  const [inoxOffers, setInoxOffers] = useState([]);
  const [bookMyShowOffers, setBookMyShowOffers] = useState([]);
  const [showTermsIndex, setShowTermsIndex] = useState(null);
  const [selectedOfferDetails, setSelectedOfferDetails] = useState("");

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
    } else {
      setFilteredCreditCards([]);
      setSelectedCard(""); // Clear selected card
    }
  };

  const handleCardSelection = (card) => {
    setSelectedCard(card);
    setQuery(card);
    setFilteredCreditCards([]);
  };

  const getOffersForSelectedCard = (offers) => {
    return offers.filter(
      (offer) => offer["Credit Card"] && offer["Credit Card"].trim() === selectedCard
    );
  };

  const openTermsOverlay = (offerDetails, index) => {
    setSelectedOfferDetails(offerDetails);
    setShowTermsIndex(index);
  };

  const closeTermsOverlay = () => {
    setShowTermsIndex(null);
    setSelectedOfferDetails("");
  };

  const selectedPvrOffers = selectedCard ? getOffersForSelectedCard(pvrOffers) : [];
  const selectedInoxOffers = selectedCard ? getOffersForSelectedCard(inoxOffers) : [];
  const selectedBookMyShowOffers = selectedCard
    ? getOffersForSelectedCard(bookMyShowOffers)
    : [];

  const noOffersMessage =
    query && filteredCreditCards.length === 0 && selectedCard === "";

  return (
    <div className="App" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      <h1>Movies Offers - Linked to your Credit Card</h1>
      <div
        className="creditCardDropdown"
        style={{ position: "relative", width: "600px", margin: "0 auto" }}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Type a Credit Card..."
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        {filteredCreditCards.length > 0 && (
          <ul
            style={{
              listStyleType: "none",
              padding: "10px",
              margin: 0,
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#fff",
              position: "absolute",
              zIndex: 1000,
            }}
          >
            {filteredCreditCards.map((card, index) => (
              <li
                key={index}
                onClick={() => handleCardSelection(card)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom:
                    index !== filteredCreditCards.length - 1
                      ? "1px solid #eee"
                      : "none",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f0f0f0")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                {card}
              </li>
            ))}
          </ul>
        )}
      </div>

      {noOffersMessage && (
        <p style={{ color: "red", textAlign: "center" }}>
          No offers available for the entered credit card.
        </p>
      )}

      {selectedCard && (
        <div className="offer-section">
          {selectedPvrOffers.length > 0 && (
            <div className="offer-container">
              <h2>PVR Offers</h2>
              <div className="offer-row">
                {selectedPvrOffers.map((offer, index) => (
                  <div key={index} className="offer-card">
                    <img src={offer.Image} alt={offer.Title} />
                    <h3>{offer.Title}</h3>
                    <p>
                      <strong>Validity:</strong> {offer.Validity}
                    </p>
                    <button
                      onClick={() => openTermsOverlay(offer.Offers, index)}
                    >
                      Click For More Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedInoxOffers.length > 0 && (
            <div className="offer-container">
              <h2>Inox Offers</h2>
              <div className="offer-row">
                {selectedInoxOffers.map((offer, index) => (
                  <div key={index} className="offer-card">
                    <img src={offer.Image} alt={offer.Title} />
                    <h3>{offer.Title}</h3>
                    <p>
                      <strong>Validity:</strong> {offer.Validity}
                    </p>
                    <button
                      onClick={() => openTermsOverlay(offer.Offers, index)}
                    >
                      Click For More Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedBookMyShowOffers.length > 0 && (
            <div className="offer-container">
              <h2>Book My Show Offers</h2>
              <div className="offer-row">
                {selectedBookMyShowOffers.map((offer, index) => (
                  <div key={index} className="offer-card">
                    <img src={offer.Image} alt={offer.Title} />
                    <h3>{offer.Title}</h3>
                    <p>
                      <strong>Offer:</strong> {offer.Offer}
                    </p>
                    <p>
                      <strong>Validity:</strong> {offer.Validity}
                    </p>
                    <button onClick={() => window.open(offer.Link, "_blank")}>
                      Click For More Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Terms Modal */}
      {showTermsIndex !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "700px",
              height: "300px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={closeTermsOverlay}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                zIndex: 1001,
              }}
            >
              &times;
            </button>
            <div
              style={{
                overflowY: "auto",
                paddingRight: "10px",
                marginTop: "40px",
                flex: 1,
              }}
            >
              <h3>Terms & Conditions</h3>
              <p>{selectedOfferDetails}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardDropdown;
