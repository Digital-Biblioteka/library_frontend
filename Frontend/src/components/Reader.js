import React, { useState } from 'react'
import { ReactReader } from 'react-reader'
import "../style/reader.css"

const Reader = () => {
    // And your own state logic to persist state
    const [location, setLocation] = useState(null)
    const locationChanged = epubcifi => {
        setLocation(epubcifi)
    }
    return (
        <div className="Reader">
            <div className="read-form">
                <ReactReader
                    location={location}
                    locationChanged={locationChanged}
                    url="https://react-reader.metabits.no/files/alice.epub"
                />
            </div>
        </div>
    )
}

export default Reader