"use client";

import { useState, useCallback } from "react";

export interface DemographicsInfo {
  age: number | null;
  gender: "male" | "female" | null;
  underlyingConditions: string;
}

interface DemographicsModalProps {
  onSubmit: (info: DemographicsInfo) => void;
}

export function DemographicsModal({ onSubmit }: DemographicsModalProps) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [underlyingConditions, setUnderlyingConditions] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(() => {
    const ageNum = parseInt(age, 10);

    if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      setError("请输入有效的年龄（1-150）");
      return;
    }
    if (!gender) {
      setError("请选择性别");
      return;
    }

    setError("");
    onSubmit({
      age: ageNum,
      gender,
      underlyingConditions: underlyingConditions.trim() || "无",
    });
  }, [age, gender, underlyingConditions, onSubmit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-fade-in-up rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏥</span>
            <div>
              <h2 className="text-xl font-bold">基本信息</h2>
              <p className="text-sm font-medium text-blue-100">
                请先填写以下信息，帮助提高分诊准确性
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="space-y-5 px-6 py-5">
          {/* Age */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-1.5">
              年龄
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(""); }}
                placeholder="请输入年龄"
                min={1}
                max={150}
                className="w-28 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <span className="text-base font-medium text-gray-500">岁</span>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-1.5">
              性别
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setGender("male"); setError(""); }}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-base font-bold transition-all ${
                  gender === "male"
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                👨 男
              </button>
              <button
                type="button"
                onClick={() => { setGender("female"); setError(""); }}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-base font-bold transition-all ${
                  gender === "female"
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                👩 女
              </button>
            </div>
          </div>

          {/* Underlying conditions */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-1.5">
              基础疾病
              <span className="ml-1 text-sm font-normal text-gray-400">（选填）</span>
            </label>
            <input
              type="text"
              value={underlyingConditions}
              onChange={(e) => setUnderlyingConditions(e.target.value)}
              placeholder="如：高血压、糖尿病... 没有请留空"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-gray-400">没有基础疾病请留空，默认为「无」</p>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={handleSubmit}
            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-lg font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
          >
            确认并开始问诊
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            您的信息仅用于本次分诊分析，不会存储
          </p>
        </div>
      </div>
    </div>
  );
}
