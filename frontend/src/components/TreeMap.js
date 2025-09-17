import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getTrees } from "../services/treeService";

const TreeMap = () => {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    getTrees().then(res => setTrees(res.data));
  }, []);

  return (
    <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trees.map(tree => (
        <Marker key={tree._id} position={[tree.location.lat, tree.location.lng]}>
          <Popup>
            {tree.treeType} by {tree.user.name} <br/>
            <img src={`http://localhost:5000/${tree.image}`} width="100" alt="tree"/>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TreeMap;
