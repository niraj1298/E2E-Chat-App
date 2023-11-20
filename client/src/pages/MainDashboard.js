import React, { useState } from 'react';
import UserIcon from '../icons/user.svg'; // Update the path to your SVG file
import AddUserIcon from '../icons/user-add.svg'; // Update the path to your SVG file

const MainDashboard = ({ username }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState([]); // Replace with your list of users

  const handleAddUser = async () => {
    setIsPopupOpen(true);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/users/${searchInput}`);
      const data = await response.json();
      setUsers([...users, data.name]);
      setIsPopupOpen(false);
      setSearchInput('');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ backgroundColor: '#EEEEEE', width: '20%', height: '100vh', color: 'black', display: 'flex', alignItems: 'center', flexDirection: 'column', border: '2px solid lightgrey' }}>
        <div style={{ display: 'flex',}}>
          <img src={UserIcon} alt="User Icon" style={{ marginTop: '4%', marginRight: '10px', visibility: isPopupOpen ? 'hidden' : 'visible' }} />
          <h1 style={{ paddingTop: '12%', fontSize: '18px' }}>Welcome {username}</h1>
        </div>

        <div style={{ display: 'flex'}}>
          <img src={AddUserIcon} alt="Add User Icon" style={{ marginRight: '132px', cursor: 'pointer' }} onClick={handleAddUser} />
        </div>

        {isPopupOpen && (
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', backgroundColor: 'darkgrey', padding: '20px' }}>
            <input type="text" value={searchInput} onChange={handleSearchInputChange} style={{ marginBottom: '10px', padding: '5px', width: '200px' }} />
            <button type="submit" style={{ backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>Add User</button>
          </form>
        )}

        {/* Display the list of users */}
        <ul style={{ marginTop: '20px' }}>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>

      {/* Messaging component */}
      <div style={{ flex: 1, border: '2px solid lightgrey' }}>
        {/* Messaging component content */}
      </div>
    </div>
  );
};

export default MainDashboard;