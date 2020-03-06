import React from 'react';

import CesiumMap from './map/CesiumMap';

class App extends React.Component {

    render() {
        return (
            <div>
                <CesiumMap ></CesiumMap>
            </div>
        );
    }
}

export default App;