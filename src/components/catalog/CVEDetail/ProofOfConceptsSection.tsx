'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { CVERecord, CVEProofOfConcept } from '@/types/cve';
import Dialog, { DialogContent, DialogFooter } from '@/components/ui/Dialog';

interface ProofOfConceptsSectionProps {
  cve: CVERecord;
  onRefresh: () => void;
}

export default function ProofOfConceptsSection({ cve, onRefresh }: ProofOfConceptsSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPoC, setEditingPoC] = useState<CVEProofOfConcept | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    author: '',
    code: '',
    language: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      author: '',
      code: '',
      language: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingPoC(null);
    setShowAddDialog(true);
  };

  const handleEdit = (poc: CVEProofOfConcept) => {
    setFormData({
      title: poc.title,
      url: poc.url || '',
      description: poc.description || '',
      author: poc.author || '',
      code: poc.code || '',
      language: poc.language || '',
    });
    setEditingPoC(poc);
    setShowAddDialog(true);
  };

  const handleClose = () => {
    setShowAddDialog(false);
    setEditingPoC(null);
    setValidationError(null);
    resetForm();
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!formData.title) {
      setValidationError('Title is required');
      return;
    }

    // Must have either URL or code
    if (!formData.url && !formData.code) {
      setValidationError('Either URL or code must be provided');
      return;
    }

    setSaving(true);
    try {
      if (editingPoC) {
        // Update existing PoC
        const response = await fetch(`/api/cves/${cve.cveId}/pocs/${editingPoC.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update PoC');
        }
      } else {
        // Create new PoC
        const response = await fetch(`/api/cves/${cve.cveId}/pocs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create PoC');
        }
      }

      onRefresh();
      handleClose();
    } catch (error) {
      console.error('Error saving PoC:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pocId: string) => {
    setDeletingId(pocId);
    try {
      const response = await fetch(`/api/cves/${cve.cveId}/pocs/${pocId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete PoC');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting PoC:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const pocs = cve.proofOfConcepts || [];

  return (
    <>
      <section className="mb-12 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Proof of Concepts</h2>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add PoC</span>
          </button>
        </div>

        {pocs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
              <p className="text-gray-400 mb-4">No proof of concepts available for this CVE.</p>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add the first PoC</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pocs.map((poc) => (
              <div
                key={poc.id}
                className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50 hover:border-gray-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{poc.title}</h3>
                    {poc.author && (
                      <p className="text-sm text-gray-400 mb-2">
                        By <span className="text-gray-300">{poc.author}</span>
                      </p>
                    )}
                    {poc.description && (
                      <p className="text-gray-300 text-sm mb-3">{poc.description}</p>
                    )}
                    {poc.url && (
                      <a
                        href={poc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors mb-3"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        <span className="break-all">{poc.url}</span>
                      </a>
                    )}
                    {poc.code && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-400 uppercase">
                            {poc.language || 'Code'}
                          </span>
                        </div>
                        <pre className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm text-gray-300 font-mono">
                            {poc.code}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(poc)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Edit PoC"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(poc.id)}
                      disabled={deletingId === poc.id}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Delete PoC"
                    >
                      {deletingId === poc.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add/Edit Dialog */}
      <Dialog
        isOpen={showAddDialog}
        onClose={handleClose}
        title={editingPoC ? 'Edit Proof of Concept' : 'Add Proof of Concept'}
        maxWidth="lg"
        footer={
          <DialogFooter>
            <button
              onClick={handleSubmit}
              disabled={!formData.title || (!formData.url && !formData.code) || saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editingPoC ? 'Update PoC' : 'Add PoC'}
            </button>
          </DialogFooter>
        }
      >
        <DialogContent className="space-y-4">
          {validationError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-400">{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Public exploit for CVE-XXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Security Researcher Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Brief description of the proof of concept..."
            />
          </div>

          <div className="border-t border-gray-600/30 pt-4">
            <p className="text-sm text-amber-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Required: Provide either a URL or paste the code directly below
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL <span className="text-gray-500 text-xs">(either URL or code required)</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username/exploit-repo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="select-input w-full"
            >
              <option value="">Select language...</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="C#">C#</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
              <option value="Ruby">Ruby</option>
              <option value="PHP">PHP</option>
              <option value="Bash">Bash</option>
              <option value="Shell">Shell</option>
              <option value="PowerShell">PowerShell</option>
              <option value="SQL">SQL</option>
              <option value="HTML">HTML</option>
              <option value="Assembly">Assembly</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Code <span className="text-gray-500 text-xs">(either URL or code required)</span>
            </label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
              placeholder="Paste exploit code here..."
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
