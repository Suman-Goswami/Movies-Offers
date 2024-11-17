import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import "./App.css"

const CreditCardDropdown = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [pvrOffers, setPvrOffers] = useState([]);
  const [inoxOffers, setInoxOffers] = useState([]);
  const [bookMyShowOffers, setBookMyShowOffers] = useState([]);
  const [showTermsIndex, setShowTermsIndex] = useState(null);
  const [selectedOfferDetails, setSelectedOfferDetails] = useState('');

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const files = [
          { name: 'Pvr final.csv', setter: setPvrOffers },
          { name: 'Inox final.csv', setter: setInoxOffers },
          { name: 'Book My Show final.csv', setter: setBookMyShowOffers },
        ];
        
        let allCreditCards = new Set();

        for (let file of files) {
          const response = await axios.get(`${process.env.PUBLIC_URL}/${file.name}`);
          const parsedData = Papa.parse(response.data, { header: true });
          
          parsedData.data.forEach((row) => {
            if (row['Credit Card']) {
              allCreditCards.add(row['Credit Card'].trim());
            }
          });

          file.setter(parsedData.data);
        }

        setCreditCards(Array.from(allCreditCards).sort());
      } catch (error) {
        console.error('Error loading CSV data:', error);
      }
    };

    fetchCSVData();
  }, []);

  const getOffersForSelectedCard = (offers) => {
    return offers.filter(
      (offer) => offer['Credit Card'] && offer['Credit Card'].trim() === selectedCard
    );
  };

  const handleSelectionChange = (event) => {
    const cardName = event.target.value;
    setSelectedCard(cardName);
    setShowTermsIndex(null); 
  };

  const openTermsOverlay = (offerDetails, index) => {
    setSelectedOfferDetails(offerDetails);
    setShowTermsIndex(index);
  };

  const closeTermsOverlay = () => {
    setShowTermsIndex(null);
    setSelectedOfferDetails('');
  };

  const selectedPvrOffers = getOffersForSelectedCard(pvrOffers);
  const selectedInoxOffers = getOffersForSelectedCard(inoxOffers);
  const selectedBookMyShowOffers = getOffersForSelectedCard(bookMyShowOffers);

  return (
    <div>
      <label htmlFor="creditCardDropdown"><h1>Credit Card</h1></label>
      <select
        id="creditCardDropdown"
        value={selectedCard}
        onChange={handleSelectionChange}
      >
        <option value="">-- Select a Credit Card --</option>
        {creditCards.map((card, index) => (
          <option key={index} value={card}>
            {card}
          </option>
        ))}
      </select>

      {/* Display PVR Offers only if offers exist for the selected card */}
      {selectedCard && selectedPvrOffers.length > 0 && (
        <div>
          <h2>PVR Offers</h2>
          {selectedPvrOffers.map((offer, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '16px', margin: '16px 0' }}>
              <img src={offer.Image} alt={offer.Title} style={{ width: '200px' }} />
              <h3>{offer.Title}</h3>
              <p><strong>Validity:</strong> {offer.Validity}</p>
              <button onClick={() => openTermsOverlay(offer.Offers, index)}>
                Click For More Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Display Inox Offers only if offers exist for the selected card */}
      {selectedCard && selectedInoxOffers.length > 0 && (
        <div>
          <h2>Inox Offers</h2>
          {selectedInoxOffers.map((offer, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '16px', margin: '16px 0' }}>
              <img src={offer.Image} alt={offer.Title} style={{ width: '200px' }} />
              <h3>{offer.Title}</h3>
              <p><strong>Validity:</strong> {offer.Validity}</p>
              <button onClick={() => openTermsOverlay(offer.Offers, index)}>
                Click For More Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Display Book My Show Offers only if offers exist for the selected card */}
      {selectedCard && selectedBookMyShowOffers.length > 0 && (
        <div>
          <h2>Book My Show Offers</h2>
          {selectedBookMyShowOffers.map((offer, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '16px', margin: '16px 0' }}>
              <img src={offer.Image} alt={offer.Title} style={{ width: '200px' }} />
              <h3>{offer.Title}</h3>
              <p><strong>Offer:</strong> {offer.Offer}</p>
              <p><strong>Validity:</strong> {offer.Validity}</p>
              <button onClick={() => window.open(offer.Link, '_blank')}>
                Click For More Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Terms & Conditions Modal Overlay */}
      {showTermsIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '700px',
            height: '300px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Non-scrollable close button */}
            <button
              onClick={closeTermsOverlay}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              &times;
            </button>
            {/* Scrollable content */}
            <div style={{
              overflowY: 'auto',
              paddingRight: '10px',
              marginTop: '40px', // Provides space below the button
              flex: 1
            }}>
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