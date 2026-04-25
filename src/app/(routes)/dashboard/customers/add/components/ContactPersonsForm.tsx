import React from 'react';
import { Users, Plus, Trash2, User, Mail, Phone } from 'lucide-react';
import type { Contact, ContactPersonsFormProps } from '../../types';

const ContactPersonsForm: React.FC<ContactPersonsFormProps> = ({
  customerType,
  contacts,
  onUpdateContacts,
}) => {
  const addContact = () => {
    const newContact: Contact = {
      name: '',
      position: '',
      email: '',
      phone: '',
      department: '',
      isPrimary: contacts.length === 0,
    };
    onUpdateContacts([...contacts, newContact]);
  };

  const removeContact = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    if (updatedContacts.length > 0 && contacts[index].isPrimary) {
      updatedContacts[0].isPrimary = true;
    }
    onUpdateContacts(updatedContacts);
  };

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const updatedContacts = contacts.map((contact, i) => {
      if (i === index) {
        if (field === 'isPrimary' && value === true) {
          return { ...contact, [field]: value };
        }
        return { ...contact, [field]: value };
      } else if (field === 'isPrimary' && value === true) {
        return { ...contact, isPrimary: false };
      }
      return contact;
    });
    onUpdateContacts(updatedContacts);
  };

  if (customerType === 'individual') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-lime-600" />
          <h2 className="text-lg font-semibold text-gray-900">Contact Persons</h2>
        </div>
        <button
          onClick={addContact}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="border rounded-lg p-4 relative">
            {contacts.length > 1 && (
              <button
                onClick={() => removeContact(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Contact Person {index + 1}
                {contact.isPrimary && (
                  <span className="ml-2 px-2 py-1 text-xs bg-lime-100 text-lime-800 rounded-full">
                    Primary
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  value={contact.position}
                  onChange={(e) => updateContact(index, 'position', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="Enter position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={contact.department}
                  onChange={(e) => updateContact(index, 'department', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="">Select Department</option>
                  <option value="Management">Management</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">Human Resources</option>
                  <option value="IT">Information Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={contact.isPrimary}
                    onChange={(e) => updateContact(index, 'isPrimary', e.target.checked)}
                    className="rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                  />
                  Set as Primary Contact
                </label>
              </div>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No contact persons added yet.</p>
            <p className="text-xs mt-1">Click &quot;Add Contact&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPersonsForm;