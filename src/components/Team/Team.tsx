"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Copy, Check, Users, LinkIcon, X } from "lucide-react"
import { useAuth } from "../../context/AppContext"

interface InviteLink {
    id: string
    link: string
    createdAt: string
}

const TeamInvite: React.FC = () => {
    const [inviteLink, setInviteLink] = useState<InviteLink | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [copied, setCopied] = useState<boolean>(false)

    const { sendTeamInvite } = useAuth()

    const createInviteLink = async (): Promise<void> => {
        setLoading(true)

        try {
            const linkUrl = await sendTeamInvite()

            if (typeof linkUrl === "string" && linkUrl.length > 0) {
                // Set the single invite link
                const newInvite: InviteLink = {
                    id: Date.now().toString(),
                    link: linkUrl,
                    createdAt: new Date().toISOString(),
                }

                setInviteLink(newInvite)
            } else {
                console.error("sendTeamInvite did not return a valid link.")
            }
        } catch (error) {
            console.error("Error creating invite link:", error)
            // Error is already handled in the context with toast
        }

        setLoading(false)
    }

    const copyToClipboard = async (link: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error("Failed to copy:", error)
            // Fallback for older browsers
            const textArea = document.createElement("textarea")
            textArea.value = link
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const clearInviteLink = (): void => {
        setInviteLink(null)
        setCopied(false)
    }

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-3">
                    <Users className="text-blue-600" size={24} />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Team Invite</h1>
                        <p className="text-slate-600 text-sm sm:text-base">Generate an invitation link for your team</p>
                    </div>
                </div>

                {!inviteLink && (
                    <button
                        onClick={createInviteLink}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto justify-center transition-colors"
                    >
                        <Plus size={16} />
                        <span>{loading ? "Creating..." : "Create Invite Link"}</span>
                    </button>
                )}
            </div>

            {/* Invite Link Display */}
            {inviteLink ? (
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-1">Your Team Invite Link</h2>
                            <p className="text-sm text-slate-600">Created: {formatDate(inviteLink.createdAt)}</p>
                        </div>
                        <button onClick={clearInviteLink} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <code className="text-sm text-slate-700 break-all flex-1 bg-white px-3 py-2 rounded border">
                                {inviteLink.link}
                            </code>
                            <button
                                onClick={() => copyToClipboard(inviteLink.link)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Users className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">How to use this invite link</h3>
                                <p className="text-blue-700 text-sm">
                                    Share this link with people you want to invite to your team. When they click the link, they'll be
                                    taken to the onboarding page where they can join your team.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => copyToClipboard(inviteLink.link)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors justify-center sm:justify-start"
                        >
                            {copied ? (
                                <>
                                    <Check size={16} />
                                    <span>Copied to clipboard!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    <span>Copy to clipboard</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={createInviteLink}
                            disabled={loading}
                            className="flex items-center space-x-2 text-green-600 hover:text-green-800 font-medium transition-colors justify-center sm:justify-start"
                        >
                            <Plus size={16} />
                            <span>{loading ? "Generating..." : "Generate new link"}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <LinkIcon className="mx-auto text-slate-400 mb-4" size={48} />
                    <p className="text-slate-500 text-lg mb-2">No invite link generated yet</p>
                    <p className="text-slate-400 mb-4">Click "Create Invite Link" to generate your team invitation</p>
                    <button
                        onClick={createInviteLink}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Plus size={16} />
                        <span>{loading ? "Creating..." : "Create Invite Link"}</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default TeamInvite
