// src/components/HostelAllocationForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HostelAllocationForm = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [selectedRoommate, setSelectedRoommate] = useState('');
  const [message, setMessage] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Fetch friends from the backend
    const fetchFriends = async () => {
      try {
        const response = await axios.get('/api/friends');
        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    // Fetch matches from the backend
    const fetchMatches = async () => {
      try {
        const response = await axios.get('/api/matches');
        setMatches(response.data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchFriends();
    fetchMatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send the vote to the backend
      const response = await axios.post('/api/vote', {
        friend: selectedFriend,
        roommate: selectedRoommate,
      });

      setMessage(response.data.message);

      // Update the matches state with the new match
      setMatches(prevMatches => [...prevMatches, response.data.match]);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setMessage('An error occurred while submitting your vote.');
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-semibold mb-6">Hostel Room Allocation</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="friend-select" className="block mb-1">
              Select Your Name:
            </label>
            <select
              id="friend-select"
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
            >
              <option value="">Select your name</option>
              {friends.map((friend) => (
                <option key={friend} value={friend}>
                  {friend}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="roommate-select" className="block mb-1">
              Choose Your Roommate:
            </label>
            <select
              id="roommate-select"
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              value={selectedRoommate}
              onChange={(e) => setSelectedRoommate(e.target.value)}
            >
              <option value="">Select your roommate</option>
              {friends
                .filter((friend) => friend !== selectedFriend)
                .map((friend) => (
                  <option key={friend} value={friend}>
                    {friend}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            disabled={!selectedFriend || !selectedRoommate}
          >
            Submit Vote
          </button>
        </form>
        <p className="text-red-500 mt-2">{message}</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Matches</h2>
          {matches.map((match, index) => (
            <div key={index} className="bg-green-100 p-2 rounded-md mb-2">
              {match.friend1} has matched with {match.friend2}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostelAllocationForm;
