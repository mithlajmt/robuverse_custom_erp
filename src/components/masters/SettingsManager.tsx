"use client";

import React, { useState, useEffect } from "react";
import { CompanySettings, BankAccount, Signatory } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";

export default function SettingsManager() {
  const [settings, setSettings] = useState<CompanySettings>(DocumentStorageService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setSettings(DocumentStorageService.getSettings());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DocumentStorageService.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddBank = () => {
    const newBank: BankAccount = {
      id: `bank_${Date.now()}`,
      bankName: "Federal Bank",
      accountName: "Nihal V",
      accountNumber: "",
      ifsc: "FDRL0001090",
      branch: "Mukkam",
      upiId: "",
      note: "",
    };
    setSettings({
      ...settings,
      bankAccounts: [...settings.bankAccounts, newBank],
    });
  };

  const handleUpdateBank = (index: number, updated: BankAccount) => {
    const banks = [...settings.bankAccounts];
    banks[index] = updated;
    setSettings({ ...settings, bankAccounts: banks });
  };

  const handleDeleteBank = (index: number) => {
    const banks = settings.bankAccounts.filter((_, i) => i !== index);
    setSettings({ ...settings, bankAccounts: banks });
  };

  const handleAddSignatory = () => {
    const newSig: Signatory = {
      id: `sig_${Date.now()}`,
      name: "New Signatory",
      title: "Authorized Signatory",
      signatureUrl: "/assets/mithlaj_sign.png",
    };
    setSettings({
      ...settings,
      signatories: [...settings.signatories, newSig],
    });
  };

  const handleUpdateSignatory = (index: number, updated: Signatory) => {
    const sigs = [...settings.signatories];
    sigs[index] = updated;
    setSettings({ ...settings, signatories: sigs });
  };

  const handleDeleteSignatory = (index: number) => {
    const sigs = settings.signatories.filter((_, i) => i !== index);
    setSettings({ ...settings, signatories: sigs });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>⚙️</span> Company Settings & Master Credentials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Robuverse LLP business profile, GSTIN, Bank Transfer accounts, Authorized signatories, and seals.
          </p>
        </div>
        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-xs font-bold animate-fade-in">
            ✓ Settings Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Company Business Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-cyan-400 border-b border-slate-800/80 pb-2 flex items-center gap-2">
            <span>🏢</span> Company Profile & Tax Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Company Legal Name</label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Company GSTIN Number</label>
              <input
                type="text"
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase(), companyGstin: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-400 mb-1 font-semibold">Registered Office Address</label>
            <textarea
              rows={2}
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value, companyAddress: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Official Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value, companyPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Official Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Website URL</label>
              <input
                type="text"
                value={settings.website || ""}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Profiles Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <span>🏦</span> Bank Accounts & Payment Instructions Profiles
            </h2>
            <button
              type="button"
              onClick={handleAddBank}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              + Add Bank Account
            </button>
          </div>

          <div className="space-y-4">
            {settings.bankAccounts.map((bank, idx) => (
              <div key={bank.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Account #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBank(idx)}
                    className="text-red-400 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      value={bank.bankName}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, bankName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">Account Beneficiary Name</label>
                    <input
                      type="text"
                      value={bank.accountName}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, accountName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-0.5">Account Number</label>
                    <input
                      type="text"
                      value={bank.accountNumber}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, accountNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-cyan-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">IFSC Code & Branch</label>
                    <input
                      type="text"
                      value={`${bank.ifsc} (${bank.branch})`}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, ifsc: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">UPI ID / PhonePe</label>
                    <input
                      type="text"
                      value={bank.upiId || ""}
                      onChange={(e) => handleUpdateBank(idx, { ...bank, upiId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-0.5">Important Notes / Beneficiary Instructions</label>
                  <input
                    type="text"
                    value={bank.note || ""}
                    onChange={(e) => handleUpdateBank(idx, { ...bank, note: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signatories & Branding */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <span>✍️</span> Authorized Signatories & Digital Seals
            </h2>
            <button
              type="button"
              onClick={handleAddSignatory}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              + Add Signatory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.signatories.map((sig, idx) => (
              <div key={sig.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Signatory #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSignatory(idx)}
                    className="text-red-400 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Name</label>
                  <input
                    type="text"
                    value={sig.name}
                    onChange={(e) => handleUpdateSignatory(idx, { ...sig, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Designation Title</label>
                  <input
                    type="text"
                    value={sig.title}
                    onChange={(e) => handleUpdateSignatory(idx, { ...sig, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Signature Asset Path</label>
                  <input
                    type="text"
                    value={sig.signatureUrl || ""}
                    onChange={(e) => handleUpdateSignatory(idx, { ...sig, signatureUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400 font-mono text-[11px]"
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
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-xl transition-all"
          >
            Save All Company Master Settings
          </button>
        </div>
      </form>
    </div>
  );
}
