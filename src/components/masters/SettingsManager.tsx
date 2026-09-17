"use client";

import { useState, useEffect } from "react";
import { CompanySettings, BankAccount, Signatory } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";

export function SettingsManager() {
  const [settings, setSettings] = useState<CompanySettings>(DocumentStorageService.getSettings());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(DocumentStorageService.getSettings());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DocumentStorageService.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddBank = () => {
    const newBank: BankAccount = {
      id: `bank_${Date.now()}`,
      bankName: "New Bank",
      accountName: settings.name,
      accountNumber: "0000000000",
      ifsc: "BANK0001234",
      branch: "Main Branch",
      upiId: "",
      note: "",
    };
    setSettings({ ...settings, bankAccounts: [...settings.bankAccounts, newBank] });
  };

  const handleDeleteBank = (index: number) => {
    const updated = settings.bankAccounts.filter((_, i) => i !== index);
    setSettings({ ...settings, bankAccounts: updated });
  };

  const handleUpdateBank = (index: number, updatedBank: BankAccount) => {
    const updated = [...settings.bankAccounts];
    updated[index] = updatedBank;
    setSettings({ ...settings, bankAccounts: updated });
  };

  const handleAddSignatory = () => {
    const newSig: Signatory = {
      id: `sig_${Date.now()}`,
      name: "Authorized Signatory",
      title: "Director / Authorized Signatory",
      signatureUrl: "/assets/sign.png",
    };
    setSettings({ ...settings, signatories: [...settings.signatories, newSig] });
  };

  const handleDeleteSignatory = (index: number) => {
    const updated = settings.signatories.filter((_, i) => i !== index);
    setSettings({ ...settings, signatories: updated });
  };

  const handleUpdateSignatory = (index: number, updatedSig: Signatory) => {
    const updated = [...settings.signatories];
    updated[index] = updatedSig;
    setSettings({ ...settings, signatories: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Company Master Settings</h1>
          <p className="text-xs text-slate-500 font-medium">Configure company name, GSTIN, registered address, bank accounts & digital signatories</p>
        </div>
        {isSaved && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            ✓ Settings saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Company Business Profile */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <span>🏢</span> Company Profile & Tax Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Company Legal Name</label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Company GSTIN Number</label>
              <input
                type="text"
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase(), companyGstin: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-indigo-700 font-extrabold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-500 mb-1 font-bold">Registered Office Address</label>
            <textarea
              rows={2}
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value, companyAddress: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Official Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value, companyPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Official Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Website URL</label>
              <input
                type="text"
                value={settings.website || ""}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Profiles Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>🏦</span> Bank Accounts & Payment Instructions Profiles
            </h2>
            <button
              type="button"
              onClick={handleAddBank}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              + Add Bank Account
            </button>
          </div>

          <div className="space-y-4">
            {settings.bankAccounts.map((bank, idx) => (
              <div key={bank.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Account #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBank(idx)}
                    className="text-rose-600 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">Bank Name</label>
                    <input
                      type="text"
                      value={bank.bankName}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, bankName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">Account Beneficiary Name</label>
                    <input
                      type="text"
                      value={bank.accountName}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, accountName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">Account Number</label>
                    <input
                      type="text"
                      value={bank.accountNumber}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, accountNumber: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-indigo-700 font-extrabold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">IFSC Code & Branch</label>
                    <input
                      type="text"
                      value={`${bank.ifsc} (${bank.branch})`}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, ifsc: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">UPI ID / PhonePe</label>
                    <input
                      type="text"
                      value={bank.upiId || ""}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, upiId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Important Notes / Beneficiary Instructions</label>
                  <input
                    type="text"
                    value={bank.note || ""}
                    onChange={(e) => handleUpdateBank(idx, { ...bank, note: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signatories & Branding */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>✍️</span> Authorized Signatories & Digital Seals
            </h2>
            <button
              type="button"
              onClick={handleAddSignatory}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              + Add Signatory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.signatories.map((sig, idx) => (
              <div key={sig.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Signatory #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSignatory(idx)}
                    className="text-rose-600 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Name</label>
                  <input
                    type="text"
                    value={sig.name}
                    onChange={(e) => handleUpdateSignatory(idx, { ...sig, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Designation Title</label>
                  <input
                    type="text"
                    value={sig.title}
                    onChange={(e) => handleUpdateSignatory(idx, { ...sig, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Signature Asset Path</label>
                  <input
                    type="text"
                    value={sig.signatureUrl || ""}
                    onChange={(e) => handleUpdateSignatory(idx, { ...sig, signatureUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-600 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer text-xs"
          >
            Save All Company Master Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsManager;
