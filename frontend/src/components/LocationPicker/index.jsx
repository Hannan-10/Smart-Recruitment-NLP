import { useState, useEffect } from 'react'
import { Country, City } from 'country-state-city'
import './LocationPicker.css'

const allCountries = Country.getAllCountries()

function parseLocation(value = '') {
  if (!value) return { countryCode: '', city: '' }
  const parts = value.split(', ')
  if (parts.length < 2) {
    const country = allCountries.find((c) => c.name === value)
    return { countryCode: country?.isoCode || '', city: '' }
  }
  const countryName = parts[parts.length - 1]
  const city = parts.slice(0, -1).join(', ')
  const country = allCountries.find((c) => c.name === countryName)
  return { countryCode: country?.isoCode || '', city }
}

function LocationPicker({ value = '', onChange, className = '' }) {
  const parsed = parseLocation(value)
  const [countryCode, setCountryCode] = useState(parsed.countryCode)
  const [city, setCity] = useState(parsed.city)

  const cities = countryCode ? City.getCitiesOfCountry(countryCode) : []

  useEffect(() => {
    if (!countryCode) return
    const country = Country.getCountryByCode(countryCode)
    const locationStr = city ? `${city}, ${country?.name}` : (country?.name || '')
    onChange(locationStr)
  }, [countryCode, city])

  const handleCountryChange = (e) => {
    setCountryCode(e.target.value)
    setCity('')
  }

  return (
    <div className={`location-picker ${className}`}>
      <select
        className="location-select"
        value={countryCode}
        onChange={handleCountryChange}
      >
        <option value="">Select Country</option>
        {allCountries.map((c) => (
          <option key={c.isoCode} value={c.isoCode}>
            {c.name}
          </option>
        ))}
      </select>

      {countryCode && (
        <select
          className="location-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={`${c.name}-${c.stateCode}`} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default LocationPicker
