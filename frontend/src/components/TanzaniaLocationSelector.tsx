import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { getRegions, getDistrictsByRegion, getWardsByDistrict, getCoordinates } from '../data/tanzaniaLocations';

interface TanzaniaLocationSelectorProps {
  onLocationSelect: (location: {
    region: string;
    district: string;
    ward: string;
    street: string;
    postcode: string;
    lat: number;
    lng: number;
  }) => void;
  initialRegion?: string;
  initialDistrict?: string;
  initialWard?: string;
  initialStreet?: string;
}

const TanzaniaLocationSelector: React.FC<TanzaniaLocationSelectorProps> = ({
  onLocationSelect,
  initialRegion = '',
  initialDistrict = '',
  initialWard = '',
  initialStreet = ''
}) => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedWard, setSelectedWard] = useState(initialWard);
  const [street, setStreet] = useState(initialStreet);
  const [customStreet, setCustomStreet] = useState('');

  const regions = getRegions();
  const districts = selectedRegion ? getDistrictsByRegion(selectedRegion) : [];
  const wards = selectedRegion && selectedDistrict ? getWardsByDistrict(selectedRegion, selectedDistrict) : [];
  const selectedWardData = wards.find(w => w.name === selectedWard);
  const availableStreets = selectedWardData?.streets || [];

  useEffect(() => {
    const finalStreet = street === '__custom__' ? customStreet : street;

    // Only update the parent component if all required fields are filled
    if (selectedRegion && selectedDistrict && selectedWard && finalStreet) {
      const ward = wards.find(w => w.name === selectedWard);
      const coordinates = getCoordinates(selectedRegion, selectedDistrict);
      
      const locationData = {
        region: selectedRegion,
        district: selectedDistrict,
        ward: selectedWard,
        street: finalStreet,
        postcode: ward?.postcode || '',
        lat: coordinates.lat,
        lng: coordinates.lng
      };
      
      onLocationSelect(locationData);
    }
  }, [selectedRegion, selectedDistrict, selectedWard, street, customStreet, onLocationSelect, wards]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedDistrict('');
    setSelectedWard('');
    setStreet('');
    setCustomStreet('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setSelectedWard('');
    setStreet('');
    setCustomStreet('');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
    setStreet('');
    setCustomStreet('');
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setStreet(e.target.value);
    if (e.target.value !== '__custom__') {
      setCustomStreet('');
    }
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Region <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={selectedRegion}
              onChange={handleRegionChange}
              required
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>District <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedRegion}
              required
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ward/Area <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={selectedWard}
              onChange={handleWardChange}
              disabled={!selectedDistrict}
              required
            >
              <option value="">Select Ward/Area</option>
              {wards.map((ward) => (
                <option key={ward.name} value={ward.name}>
                  {ward.name} - {ward.postcode}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Street/Address <span className="text-danger">*</span></Form.Label>
            {availableStreets.length > 0 ? (
              <>
                <Form.Select
                  value={street}
                  onChange={handleStreetChange}
                  disabled={!selectedWard}
                  required
                >
                  <option value="">Select Street</option>
                  {availableStreets.map((streetName) => (
                    <option key={streetName} value={streetName}>
                      {streetName}
                    </option>
                  ))}
                  <option value="__custom__">Other (Type your own)</option>
                </Form.Select>
                {street === '__custom__' && (
                  <Form.Control
                    type="text"
                    value={customStreet}
                    onChange={(e) => setCustomStreet(e.target.value)}
                    placeholder="Enter custom street name"
                    className="mt-2"
                    required
                  />
                )}
              </>
            ) : (
              <Form.Control
                type="text"
                value={street}
                onChange={handleStreetChange}
                placeholder="Enter street name or building"
                disabled={!selectedWard}
                required
              />
            )}
          </Form.Group>
        </Col>
      </Row>

      {selectedRegion && selectedDistrict && selectedWard && (
        <div className="alert alert-info">
          <small>
            <strong>Selected Location:</strong> {(street === '__custom__' ? customStreet : street) ? `${street === '__custom__' ? customStreet : street}, ` : ''}{selectedWard}, {selectedDistrict}, {selectedRegion}
            {wards.find(w => w.name === selectedWard) && (
              <> | <strong>Postcode:</strong> {wards.find(w => w.name === selectedWard)?.postcode}</>
            )}
          </small>
        </div>
      )}
    </div>
  );
};

export default TanzaniaLocationSelector;
