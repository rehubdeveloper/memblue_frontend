"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Copy, Check, Users, LinkIcon, X } from "lucide-react"
import { useAuth } from "../../context/AppContext"

interface TeamMember {
    id: string
    name: string
    email: string
    username: string
    phone: string
    position: string
    role: string
}

interface InviteLink {
    id: string
    link: string
    createdAt: string
}

const TeamInvite: React.FC = () => {
    const [inviteLink, setInviteLink] = useState<InviteLink | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [copied, setCopied] = useState<boolean>(false)

    const { sendTeamInvite, teamMembers } = useAuth()

    const createInviteLink = async (): Promise<void> => {
        setLoading(true)

        try {
            const linkUrl: string = await sendTeamInvite()

            // Set the single invite link
            const newInvite: InviteLink = {
                id: Date.now().toString(),
                link: linkUrl,
                createdAt: new Date().toISOString(),
            }

            setInviteLink(newInvite)
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

    // Helper function to generate initials safely
    const getInitials = (name: string | undefined | null): string => {
        if (!name || typeof name !== 'string') {
            return "?"
        }

        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) // Limit to 2 characters
    }

    // Helper function to safely get member property
    const getMemberProperty = (member: any, property: string): string => {
        return member?.[property] || "N/A"
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

            {inviteLink ? (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-slate-900">Team Invite Link</h2>
                        <button onClick={clearInviteLink} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
                        <code className="text-sm text-slate-700 break-all flex-1 bg-slate-50 px-3 py-2 rounded border text-xs">
                            {inviteLink.link}
                        </code>
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(inviteLink.link)}
                                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? "Copied!" : "Copy"}</span>
                            </button>
                            <button
                                onClick={createInviteLink}
                                disabled={loading}
                                className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                            >
                                <Plus size={14} />
                                <span>New</span>
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">
                        Created: {formatDate(inviteLink.createdAt)} • Share this link to invite team members
                    </p>
                </div>
            ) : (
                <div className="text-center py-4 bg-white rounded-lg border border-slate-200 mb-6">
                    <LinkIcon className="mx-auto text-slate-400 mb-3" size={32} />
                    <p className="text-slate-500 mb-2">No invite link generated</p>
                    <button
                        onClick={createInviteLink}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Plus size={16} />
                        <span>{loading ? "Creating..." : "Create Invite Link"}</span>
                    </button>
                </div>
            )}

            {/* Team Members Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="text-slate-600" size={20} />
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
                                <p className="text-sm text-slate-600">
                                    {teamMembers?.length || 0} member{(teamMembers?.length || 0) !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {teamMembers && teamMembers.length > 0 ? (
                        <div className="grid gap-3">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.id || `member-${Math.random()}`}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-sm">
                                                {getInitials(member.name)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                    {getMemberProperty(member, 'name')}
                                                </h3>
                                                <span
                                                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${member.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {getMemberProperty(member, 'role')}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-slate-600">
                                                <span className="truncate">{getMemberProperty(member, 'email')}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{getMemberProperty(member, 'position')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">@{getMemberProperty(member, 'username')}</p>
                                            <p className="text-xs text-slate-400">{getMemberProperty(member, 'phone')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <Users className="mx-auto text-slate-400 mb-3" size={32} />
                            <p className="text-slate-500 mb-1">No team members yet</p>
                            <p className="text-xs text-slate-400">Invite team members using the link above</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TeamInvite