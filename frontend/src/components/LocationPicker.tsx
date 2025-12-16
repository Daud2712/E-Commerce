import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Button, Form, Modal, Alert } from 'react-bootstrap';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialAddress?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: -6.7924, // Dar es Salaam, Tanzania
  lng: 39.2083
};

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialAddress }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState(initialAddress || '');

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedPosition({ lat, lng });

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  }, []);

  const handleConfirm = () => {
    if (selectedPosition && address) {
      onLocationSelect({ address, lat: selectedPosition.lat, lng: selectedPosition.lng });
      setShowModal(false);
    }
  };

  // Note: You'll need to add your Google Maps API key to the .env file
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <>
      <div className="d-flex gap-2 align-items-center">
        <Form.Control
          type="text"
          value={address}
          readOnly
          placeholder="Click 'Select on Map' to choose your location"
        />
        <Button variant="primary" onClick={() => setShowModal(true)}>
          📍 Select on Map
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Your Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {apiKey ? (
            <LoadScript googleMapsApiKey={apiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPosition || defaultCenter}
                zoom={12}
                onClick={onMapClick}
              >
                {selectedPosition && <Marker position={selectedPosition} />}
              </GoogleMap>
              <div className="mt-3">
                <Form.Group>
                  <Form.Label>Selected Address:</Form.Label>
                  <Form.Control
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address will appear here when you click on the map"
                  />
                  <Form.Text className="text-muted">
                    Click on the map to select a location, or edit the address manually.
                  </Form.Text>
                </Form.Group>
              </div>
            </LoadScript>
          ) : (
            <Alert variant="warning">
              Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
              <br />
              <small>For now, you can enter the address manually below:</small>
              <Form.Control
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="mt-2"
              />
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!address}>
            Confirm Location
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LocationPicker;
