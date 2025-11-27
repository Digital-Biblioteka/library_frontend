import React, { useState } from 'react'
import { ReactReader } from 'react-reader'
import "../style/reader.css"
import { useLocation } from "react-router-dom"

const Reader = () => {
    const { state } = useLocation();
    const url = state?.url; // получили URL книги

    const [location, setLocation] = useState(null)
    const locationChanged = epubcifi => {
        setLocation(epubcifi)
    }
    console.log(url);

    return (
        <div className="Reader">
            <ReactReader
                location={location}
                locationChanged={locationChanged}
                url={url}
            />
        </div>
    )
}

export default Reader
