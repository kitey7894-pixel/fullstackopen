import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null)

  const [lat, lon] = country.capitalInfo?.latlng || country.latlng

  useEffect(() => {
    axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`
      )
      .then(response => setWeather(response.data.current))
  }, [lat, lon])

  if (!weather) {
    return null
  }

  return (
    <div>
      <h2>Weather in {country.capital?.[0]}</h2>
      <p>temperature {weather.temperature_2m} Celsius</p>
      <p>wind {weather.wind_speed_10m} m/s</p>
    </div>
  )
}

const CountryDetails = ({ country }) => (
  <div>
    <h1>{country.name.common}</h1>
    <p>capital {country.capital?.[0]}</p>
    <p>area {country.area}</p>
    <h2>languages</h2>
    <ul>
      {Object.values(country.languages || {}).map(language => (
        <li key={language}>{language}</li>
      ))}
    </ul>
    <img src={country.flags.png} alt={country.flags.alt || `flag of ${country.name.common}`} width="200" />
    <Weather country={country} />
  </div>
)

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => setCountries(response.data))
  }, [])

  const handleSearchChange = event => {
    setSearch(event.target.value)
    setSelected(null)
  }

  const matches = countries.filter(country =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  let content
  if (search === '') {
    content = null
  } else if (matches.length > 10) {
    content = <p>Too many matches, specify another filter</p>
  } else if (matches.length > 1) {
    content = (
      <div>
        {matches.map(country => (
          <p key={country.name.common}>
            {country.name.common}{' '}
            <button onClick={() => setSelected(country)}>Show</button>
          </p>
        ))}
      </div>
    )
  } else if (matches.length === 1) {
    content = <CountryDetails country={matches[0]} />
  } else {
    content = <p>No matches</p>
  }

  return (
    <div>
      <div>
        find countries <input value={search} onChange={handleSearchChange} />
      </div>
      {selected ? <CountryDetails country={selected} /> : content}
    </div>
  )
}

export default App
