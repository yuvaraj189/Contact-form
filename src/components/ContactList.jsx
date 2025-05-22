import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [message, setMessage] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts', err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Sort contacts
  const sortedContacts = [...contacts].sort((a, b) => {
    if (sortOrder === 'asc') return a.firstName.localeCompare(b.firstName);
    return b.firstName.localeCompare(a.firstName);
  });

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Delete contact (soft delete)
  const deleteContact = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`);
      setMessage('Contact deleted');
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact', err);
    }
  };

  // Recover all deleted contacts
  const recoverContacts = async () => {
    try {
      await axios.post('http://localhost:5000/api/contacts/recover');
      setMessage('Deleted contacts recovered');
      fetchContacts();
    } catch (err) {
      console.error('Error recovering contacts', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Saved Contacts</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSort}
            className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Sort: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
          </button>
          <button
            onClick={recoverContacts}
            className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Recover Deleted
          </button>
        </div>
      </div>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      {sortedContacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Picture</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Birthday</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  {contact.picture ? (
                    <img
                      src={`http://localhost:5000/uploads/${contact.picture}`}
                      alt="Profile"
                      className="h-12 w-12 object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="p-2 border">{contact.firstName}</td>
                <td className="p-2 border">{contact.contact}</td>
                <td className="p-2 border">{contact.birthday}</td>
                <td className="p-2 border">{contact.email}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContactList;
