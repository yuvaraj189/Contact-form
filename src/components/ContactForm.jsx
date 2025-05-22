import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    birthday: '',
    email: '',
    picture: null,
  });

  const [preview, setPreview] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [recoverContact, setRecoverContact] = useState('');
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [sortKey, setSortKey] = useState(null);

  const validate = () => {
    const errs = {};
    const namePattern = /^[A-Z][a-z]*$/;

    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (!namePattern.test(formData.firstName)) {
      errs.firstName = 'First letter must be capital, only alphabets allowed';
    }

    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (!namePattern.test(formData.lastName)) {
      errs.lastName = 'First letter must be capital, only alphabets allowed';
    }

    const totalNameLength = formData.firstName.length + formData.lastName.length;
    if (totalNameLength > 50) {
      errs.firstName = errs.firstName || 'Total name length must be ≤ 50 characters';
      errs.lastName = errs.lastName || 'Total name length must be ≤ 50 characters';
    }

    if (!formData.contact.trim()) {
      errs.contact = 'Contact number is required';
    } else if (!/^\+91\d{10}$/.test(formData.contact)) {
      errs.contact = 'Must be +91 followed by 10 digits';
    } else if (/^\+910{10}$/.test(formData.contact)) {
      errs.contact = 'Contact cannot be all zeros';
    } else if (/^\+91[12]/.test(formData.contact)) {
      errs.contact = 'Number cannot start with 1 or 2 after +91';
    }

    if (!formData.birthday.trim()) {
      errs.birthday = 'Birthday is required';
    } else {
      const today = new Date();
      const enteredDate = new Date(formData.birthday);
      if (enteredDate > today) {
        errs.birthday = 'Birthday cannot be in the future';
      }
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      errs.email = 'Invalid email address';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'picture') {
      const file = files[0];
      if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, picture: 'Only JPG or PNG allowed' }));
        return;
      }
      if (file && file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, picture: 'Max size is 2MB' }));
        return;
      }

      setFormData((prev) => ({ ...prev, picture: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newContact = {
      ...formData,
      id: editIndex !== null ? contacts[editIndex].id : Date.now(),
      picture: preview,
    };

    if (editIndex !== null) {
      const updated = [...contacts];
      updated[editIndex] = newContact;
      setContacts(updated);
      setEditIndex(null);
    } else {
      setContacts([...contacts, newContact]);
    }

    setFormData({ firstName: '', lastName: '', contact: '', birthday: '', email: '', picture: null });
    setPreview(null);
  };

  const handleEdit = (index) => {
    const contact = contacts[index];
    setFormData({ ...contact });
    setPreview(contact.picture);
    setEditIndex(index);
  };

  const handleDelete = (id) => {
    const deleted = contacts.find((c) => c.id === id);
    setDeletedContacts([...deletedContacts, deleted]);
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleRecover = (contactNumber) => {
    const index = deletedContacts.findIndex(
      (c) => c.contact.trim() === contactNumber.trim()
    );

    if (index !== -1) {
      const recovered = deletedContacts[index];
      setContacts([...contacts, recovered]);
      const updatedDeleted = [...deletedContacts];
      updatedDeleted.splice(index, 1);
      setDeletedContacts(updatedDeleted);
      setRecoverContact('');
    } else {
      alert('No deleted contact found with that contact number.');
    }
  };

  const handleSort = (key) => {
    const sorted = [...contacts];
    if (key === 'birthday') {
      sorted.sort((a, b) => new Date(a.birthday) - new Date(b.birthday));
    } else {
      sorted.sort((a, b) => a[key].localeCompare(b[key]));
    }
    setContacts(sorted);
    setSortKey(key);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="p-6 border border-gray-200 shadow-lg rounded-xl bg-white">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">{editIndex !== null ? 'Edit' : 'Add'} Contact</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name*</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Last Name*</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Contact Number*</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="+91XXXXXXXXXX" className="w-full border p-2 rounded mt-1" />
            {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Birthday*</label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} max={new Date().toISOString().split("T")[0]} className="w-full border p-2 rounded mt-1" />
            {errors.birthday && <p className="text-red-500 text-sm">{errors.birthday}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Email*</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Profile Picture</label>
            <input type="file" name="picture" accept="image/*" onChange={handleChange} className="w-full mt-1" />
            {errors.picture && <p className="text-red-500 text-sm">{errors.picture}</p>}
            {preview && <img src={preview} alt="Preview" className="mt-3 w-28 h-28 object-cover rounded border" />}
          </div>
        </div>

        <button type="submit" className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
          {editIndex !== null ? 'Update Contact' : 'Save Contact'}
        </button>
      </form>

      {/* Contact List */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Saved Contacts</h3>
          <div className="flex gap-2">
            <button onClick={() => handleSort('firstName')} className={`px-3 py-1 border rounded ${sortKey === 'firstName' ? 'bg-blue-100' : ''}`}>Sort by Name</button>
            <button onClick={() => handleSort('birthday')} className={`px-3 py-1 border rounded ${sortKey === 'birthday' ? 'bg-blue-100' : ''}`}>Sort by DOB</button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <p className="text-gray-500">No contacts added yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {contacts.map((c, i) => (
              <div key={c.id} className="bg-gray-100 p-4 rounded-xl shadow flex gap-4 items-center">
                {c.picture && <img src={c.picture} alt="Profile" className="w-20 h-20 object-cover rounded-full border" />}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{c.firstName} {c.lastName}</p>
                  <p className="text-sm text-gray-700">{c.contact}</p>
                  <p className="text-sm text-gray-700">{c.email}</p>
                  <p className="text-sm text-gray-700">Birthday: {c.birthday}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(i)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recovery Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Recover Deleted Contact</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={recoverContact}
            onChange={(e) => setRecoverContact(e.target.value)}
            placeholder="Enter contact number to recover (e.g. +91XXXXXXXXXX)"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => handleRecover(recoverContact)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Recover
          </button>
        </div>
        {deletedContacts.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">Deleted Contacts: {deletedContacts.length}</p>
        )}
      </div>
    </div> 
  );
};

export default ContactForm;
