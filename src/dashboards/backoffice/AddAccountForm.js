import React from 'react';
import { useDispatch } from 'react-redux';
import { addAccount } from '../../actions/accountActions';
import { useState } from 'react';
import CustomAlert from '../../components/CustomAlert';

function AddAccountForm({ onCancel }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      nature: e.target.nature.value,
      solde: parseFloat(e.target.solde.value),
      email: e.target.email.value,
    };
    setIsOpen(true); // Show the custom alert modal
    dispatch(addAccount(formData));
  };

  const handleAlertClose = () => {
    setIsOpen(false); // Close the custom alert modal
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ajouter compte</h1>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nature">
            Nature
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nature"
            type="text"
            placeholder="Nature"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="solde">
            Solde
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="solde"
            type="number"
            placeholder="Solde"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Add Account
          </button>
          <button
            className="ml-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
      
      <CustomAlert
        isOpen={isOpen}
        onClose={handleAlertClose}
        title="Alert"
        message="L'opération va prendre quelques secondes. Le code PIN du client sera envoyé par email."
        actionLabel="OK"
      />

    </div>
  );
}

export default AddAccountForm;