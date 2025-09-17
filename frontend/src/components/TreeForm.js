import { useState } from "react";
import { addTree } from "../services/treeService";

const TreeForm = ({ userId }) => {
  const [treeType, setTreeType] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user", userId);
    formData.append("treeType", treeType);
    formData.append("lat", lat);
    formData.append("lng", lng);
    formData.append("image", image);
    await addTree(formData);
    alert("Tree added!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Tree Type" value={treeType} onChange={e => setTreeType(e.target.value)} required/>
      <input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} required/>
      <input placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} required/>
      <input type="file" onChange={e => setImage(e.target.files[0])} />
      <button type="submit">Add Tree</button>
    </form>
  );
};

export default TreeForm;
