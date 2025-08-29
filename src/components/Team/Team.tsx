import type React from "react"

import { useState, useContext, useEffect } from "react"
import { Plus, Copy, Check, Users, LinkIcon, X, Shield } from "lucide-react"
import { AuthContext } from "../../context/AppContext"

interface TeamMemberData {
    id: number
    user_code: string
    username: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    primary_trade: string
    secondary_trades: string[]
    business_type: string
    role: string
    can_create_jobs: boolean
    team: number
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
    const [grantingPermission, setGrantingPermission] = useState<number | null>(null)

    const context = useContext(AuthContext);
    const getTeamMembers = context?.getTeamMembers;
    const sendTeamInvite = context?.sendTeamInvite;
    const grantJobCreationPermission = context?.grantJobCreationPermission;
    const notifyTeamInviteSent = context?.notifyTeamInviteSent;

      // Data is now loaded once in the context, no need to fetch here
  // useEffect(() => {
  //   if (getTeamMembers) {
  //     getTeamMembers();
  //   }
  // }, []);

    // Map TeamMember to TeamMemberData for UI compatibility
    const teamMembers = (context?.teamMembers ?? []).map((member: any) => ({
        id: member.id,
        user_code: member.user_code || '',
        username: member.username,
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        phone_number: member.phone_number || member.phone || '',
        primary_trade: member.primary_trade || '',
        secondary_trades: member.secondary_trades || [],
        business_type: member.business_type || '',
        role: member.role,
        can_create_jobs: member.can_create_jobs,
        team: member.team || 0,
    }));

    const createInviteLink = async (): Promise<void> => {
        setLoading(true)
        try {
            if (!sendTeamInvite) throw new Error('Team invite not available');
            const linkUrl: string = await sendTeamInvite();
            // Set the single invite link
            const newInvite: InviteLink = {
                id: Date.now().toString(),
                link: linkUrl,
                createdAt: new Date().toISOString(),
            }
            setInviteLink(newInvite)
            
            // Add notification for team invite
            if (notifyTeamInviteSent) {
                notifyTeamInviteSent('team member');
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

    // Helper function to generate initials safely
    const getInitials = (firstName: string, lastName: string): string => {
        const first = firstName?.charAt(0)?.toUpperCase() || ""
        const last = lastName?.charAt(0)?.toUpperCase() || ""
        return first + last || "?"
    }

    // Helper function to format trade names
    const formatTradeName = (trade: string): string => {
        return trade.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Helper function to get full name
    const getFullName = (member: TeamMemberData): string => {
        return `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A'
    }

    // Helper function to get primary trade display
    const getPrimaryTrade = (member: TeamMemberData): string => {
        return member.primary_trade ? formatTradeName(member.primary_trade) : 'N/A'
    }

    // Helper function to get member card styling based on role
    const getMemberCardStyling = (member: TeamMemberData) => {
        if (member.role === 'admin') {
            return {
                cardClass: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 shadow-md space-y-3 sm:space-y-0",
                avatarClass: "w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0",
                avatarTextClass: "text-white font-bold text-xs sm:text-sm"
            }
        }
        return {
            cardClass: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors space-y-3 sm:space-y-0",
            avatarClass: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0",
            avatarTextClass: "text-blue-600 font-semibold text-xs sm:text-sm"
        }
    }

    const handleGrantPermission = async (memberId: number): Promise<void> => {
        setGrantingPermission(memberId);
        try {
            if (!grantJobCreationPermission) throw new Error('Grant permission function not available');
            await grantJobCreationPermission(memberId);
            // The context will handle the toast message and refresh team members
        } catch (error) {
            console.error("Error granting permission:", error);
            // Error is already handled in the context with toast
        }
        setGrantingPermission(null);
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
                        <code className="text-xs sm:text-sm text-slate-700 break-all flex-1 bg-slate-50 px-2 sm:px-3 py-2 rounded border w-full sm:w-auto">
                            {inviteLink.link}
                        </code>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => copyToClipboard(inviteLink.link)}
                                className="flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex-1 sm:flex-none"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                            </button>
                            <button
                                onClick={createInviteLink}
                                disabled={loading}
                                className="flex items-center justify-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors px-3 py-1.5 rounded border border-green-200 hover:bg-green-50 flex-1 sm:flex-none"
                            >
                                <Plus size={14} />
                                <span className="hidden sm:inline">New</span>
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
                <div className="p-3 sm:p-4 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <Users className="text-slate-600" size={20} />
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Team Members</h2>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    {teamMembers?.length || 0} member{(teamMembers?.length || 0) !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 sm:p-4">
                    {teamMembers && teamMembers.length > 0 ? (
                        <div className="grid gap-3">
                            {teamMembers.map((member: TeamMemberData) => {
                                const styling = getMemberCardStyling(member)
                                return (
                                    <div
                                        key={member.id}
                                        className={styling.cardClass}
                                    >
                                        {/* Mobile and Desktop Layout */}
                                        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                            <div className={styling.avatarClass}>
                                                <span className={styling.avatarTextClass}>
                                                    {getInitials(member.first_name, member.last_name)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-1">
                                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                                                        {getFullName(member)}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-0">
                                                        <span
                                                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${member.role === "admin"
                                                                ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200"
                                                                : "bg-green-100 text-green-800"
                                                                }`}
                                                        >
                                                            {member.role === "admin" ? "👑 Admin" : member.role}
                                                        </span>
                                                        {member.can_create_jobs && (
                                                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                                Jobs
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-slate-600 space-y-1 sm:space-y-0">
                                                    <span className="truncate">{member.email || 'N/A'}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="truncate">{getPrimaryTrade(member)}</span>
                                                    {member.secondary_trades && member.secondary_trades.length > 0 && (
                                                        <>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span className="text-slate-500">
                                                                +{member.secondary_trades.length} more
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Info - Mobile: Below, Desktop: Right */}
                                        <div className="flex justify-between sm:justify-end items-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                                            <div className="flex flex-col sm:text-right space-y-0.5">
                                                <p className="text-xs text-slate-500">@{member.username || 'N/A'}</p>
                                                <p className="text-xs text-slate-400">{member.phone_number || 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-right sm:ml-4">
                                                    <p className="text-xs text-slate-400">#{member.user_code || 'N/A'}</p>
                                                </div>
                                                {/* Grant Permission Button - Only show for members who don't have permission and if user is admin */}
                                                {context?.user?.role === 'admin' && !member.can_create_jobs && (
                                                    <button
                                                        onClick={() => handleGrantPermission(member.id)}
                                                        disabled={grantingPermission === member.id}
                                                        className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                        title="Grant job creation permission"
                                                    >
                                                        <Shield size={12} />
                                                        <span className="">
                                                            {grantingPermission === member.id ? "Granting..." : "Grant"}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
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