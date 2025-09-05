import React, { useState } from 'react'
import { Plus, Phone, Trash2, AlertTriangle, Users } from 'lucide-react'

const ContactList = ({ contacts, onContactsUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    priority: 'normal'
  })

  const relationships = [
    'Family Member',
    'Friend',
    'Lawyer',
    'Emergency Contact',
    'Legal Aid Organization',
    'Other'
  ]

  const handleAddContact = (e) => {
    e.preventDefault()
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in name and phone number')
      return
    }

    const contact = {
      id: Date.now().toString(),
      ...newContact,
      dateAdded: new Date().toISOString()
    }

    onContactsUpdate([...contacts, contact])
    setNewContact({ name: '', phone: '', relationship: '', priority: 'normal' })
    setShowAddForm(false)
  }

  const handleDeleteContact = (contactId) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      onContactsUpdate(contacts.filter(c => c.id !== contactId))
    }
  }

  const sendAlert = (contact) => {
    const message = `POLICE ENCOUNTER ALERT: This is an automated message from Pocket Lawyer. The user may need assistance. Contact them immediately.`
    
    // In a real app, this would send an actual SMS/call
    if (navigator.share) {
      navigator.share({
        title: 'Police Encounter Alert',
        text: message,
        url: window.location.href
      })
    } else {
      // Fallback to copying message
      navigator.clipboard.writeText(message)
      alert(`Alert message copied to clipboard. Call ${contact.name} at ${contact.phone}`)
    }
  }

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Emergency Contacts
        </h2>
        <p className="text-gray-600">
          Manage your emergency contact network
        </p>
      </div>

      {/* Quick Alert Button */}
      {contacts.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span>Emergency Alert</span>
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Send an immediate alert to all your emergency contacts
          </p>
          <button
            onClick={() => {
              contacts.forEach(contact => {
                if (contact.priority === 'high') {
                  sendAlert(contact)
                }
              })
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium w-full"
          >
            Send Emergency Alert Now
          </button>
        </div>
      )}

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Add New Contact</h3>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select relationship...</option>
                  {relationships.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={newContact.priority}
                  onChange={(e) => setNewContact(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary flex-1">
                Add Contact
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Contact Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Emergency Contact</span>
        </button>
      )}

      {/* Contacts List */}
      {contacts.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Your Contacts</h3>
          
          {contacts
            .sort((a, b) => (b.priority === 'high') - (a.priority === 'high'))
            .map(contact => (
              <div key={contact.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      {contact.priority === 'high' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          High Priority
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} />
                        <span>{formatPhoneNumber(contact.phone)}</span>
                      </div>
                      {contact.relationship && (
                        <div className="flex items-center space-x-2">
                          <Users size={14} />
                          <span>{contact.relationship}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => sendAlert(contact)}
                      className="bg-accent hover:bg-accent/90 text-white p-2 rounded-lg transition-colors"
                      title="Send Alert"
                    >
                      <AlertTriangle size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : !showAddForm && (
        <div className="card text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Contacts Added</h3>
          <p className="text-gray-500 mb-4">
            Add emergency contacts who can be notified during police encounters
          </p>
        </div>
      )}

      {/* Legal Resources */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Legal Aid Resources</h3>
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium text-blue-800">ACLU National</h4>
            <p className="text-blue-700">Call: (212) 549-2500</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800">National Lawyers Guild</h4>
            <p className="text-blue-700">Call: (415) 285-5067</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800">Legal Aid Society</h4>
            <p className="text-blue-700">Find local chapter at legalaid.org</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactList