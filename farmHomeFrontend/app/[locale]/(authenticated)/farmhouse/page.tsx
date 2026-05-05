"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Loader2, Plus, Trash2 } from "lucide-react"
import { config } from "@/config"
import Link from "next/link"
import { useTranslations } from 'next-intl';
import { useRef } from "react";
import UserAutocomplete, { UserOption } from "@/components/UserAutocomplete";

interface Farmhouse {
  _id?: string;
  f_id: string;
  name: string;
  manager?: string;
  admin?: string;
  assistants: string[];
  location?: string;
}

export default function FarmhousePage() {
  const [farmhouses, setFarmhouses] = useState<Farmhouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [managerOptions, setManagerOptions] = useState<UserOption[]>([]);
  const [assistantOptions, setAssistantOptions] = useState<UserOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [editForm, setEditForm] = useState({
    f_id: "",
    name: "",
    manager: null as UserOption | null,
    assistants: [] as UserOption[],
    location: ""
  });
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [roleFarmhouses, setRoleFarmhouses] = useState<Farmhouse[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const t = useTranslations('FarmhousePage');
  const tOrders = useTranslations('OrdersPage');
  const [userCache, setUserCache] = useState<{ [id: string]: { name: string; _id: string } }>({});
  const userCacheRef = useRef<{ [id: string]: { name: string; _id: string } }>({});

  // Pagination state for roleFarmhouses (admin/manager/assistant)
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const paginatedFarmhouses = roleFarmhouses.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(roleFarmhouses.length / rowsPerPage);

  // Pagination state for farmhouses (super_admin)
  const [superPage, setSuperPage] = useState(1);
  const superRowsPerPage = 10;
  const paginatedSuperFarmhouses = farmhouses.slice((superPage - 1) * superRowsPerPage, superPage * superRowsPerPage);
  const superTotalPages = Math.ceil(farmhouses.length / superRowsPerPage);

  useEffect(() => {
    // Get user id and role from localStorage
    let idRaw = localStorage.getItem("id") || "";
    let cleanId = idRaw;
    try { cleanId = JSON.parse(idRaw); } catch { cleanId = idRaw; }
    if (typeof cleanId === "string") cleanId = cleanId.replace(/^"+|"+$/g, "");
    setUserId(cleanId);
    setRole(localStorage.getItem("role"));
  }, []);

  // Fetch farmhouses
  const fetchFarmhouses = async () => {
    setLoading(true)
    setError(null)
    try {
      // Public GET endpoint, no auth required
      const res = await fetch(`${config.backendUrl}/farmhouse`)
      if (!res.ok) throw new Error('Failed to fetch farmhouses')
      const data = await res.json()
      setFarmhouses(Array.isArray(data.farmhouses) ? data.farmhouses : data)
    } catch (err) {
      setError('Error fetching farmhouses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarmhouses()
  }, [])

  const fetchUserOptions = async () => {
    setLoadingOptions(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const adminIdRaw = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
      let cleanId = adminIdRaw;
      try { cleanId = JSON.parse(adminIdRaw!); } catch { cleanId = adminIdRaw; }
      if (typeof cleanId === "string") cleanId = cleanId.replace(/^"+|"+$/g, "");
      const res = await fetch(`${config.backendUrl}/farmhouse-users/${cleanId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch users');
      const doc = await res.json();
      const managerIds = (doc?.managers || []).map((u: any) => typeof u === 'string' ? u : u._id);
      const assistantIds = (doc?.assistants || []).map((u: any) => typeof u === 'string' ? u : u._id);
      const fetchUser = async (id: string) => {
        const res = await fetch(`${config.backendUrl}/auth/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return null;
        const user = await res.json();
        return { _id: user._id, name: user.name, email: user.email };
      };
      const managerOpts = (await Promise.all(managerIds.map(fetchUser))).filter(Boolean) as UserOption[];
      const assistantOpts = (await Promise.all(assistantIds.map(fetchUser))).filter(Boolean) as UserOption[];
      setManagerOptions(managerOpts);
      setAssistantOptions(assistantOpts);
    } catch {
      setManagerOptions([]);
      setAssistantOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Handle edit button click
  const handleEditClick = async (farmhouse: Farmhouse) => {
    setEditId(farmhouse._id || "");
    await fetchUserOptions();
    setEditForm({
      f_id: farmhouse.f_id,
      name: farmhouse.name,
      manager: managerOptions.find(opt => opt._id === farmhouse.manager) || null,
      assistants: (farmhouse.assistants || []).map(aid => assistantOptions.find(opt => opt._id === aid)).filter(Boolean) as UserOption[],
      location: farmhouse.location || ""
    });
  }

  // Handle edit form change
  const handleEditFormChange = (field: keyof typeof editForm, value: any) => {
    setEditForm({ ...editForm, [field]: value });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${config.backendUrl}/farmhouse/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          f_id: editForm.f_id,
          Name: editForm.name,
          manager_id: editForm.manager?._id || "",
          assistants: editForm.assistants.map(a => a._id),
          location: editForm.location
        })
      });
      if (!res.ok) throw new Error('Failed to update farmhouse');
      setEditId(null);
      setEditForm({ f_id: "", name: "", manager: null, assistants: [], location: "" });
      await fetchFarmhouses();
      if (role === "admin" || role === "manager" || role === "assistant") {
        // refresh role-specific list
        const endpoint = role === "admin" ? "/farmhouse/admin" : role === "manager" ? "/farmhouse/manager" : "/farmhouse/assistant";
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${config.backendUrl}${endpoint}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        if (res.ok) {
          const data = await res.json();
          setRoleFarmhouses(Array.isArray(data.farmhouses) ? data.farmhouses : data);
        }
      }
    } catch (err) {
      alert('Error updating farmhouse');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    setDeleteLoadingId(id);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${config.backendUrl}/farmhouse/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete farmhouse');
      await fetchFarmhouses();
      if (role === "admin" || role === "manager" || role === "assistant") {
        // refresh role-specific list
        const endpoint = role === "admin" ? "/farmhouse/admin" : role === "manager" ? "/farmhouse/manager" : "/farmhouse/assistant";
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${config.backendUrl}${endpoint}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        if (res.ok) {
          const data = await res.json();
          setRoleFarmhouses(Array.isArray(data.farmhouses) ? data.farmhouses : data);
        }
      }
    } catch (err) {
      alert('Error deleting farmhouse');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Only super_admin or admin of the farmhouse can edit/delete
  const canEditOrDelete = (farmhouse: Farmhouse) => {
    return role === "super_admin" || (role === "admin" && userId && farmhouse.admin === userId);
  };

  // Only super_admin or admin can add new farmhouse
  const canAddFarmhouse = role === "admin";

  // Fetch farmhouses for the current user's role
  useEffect(() => {
    if (!role) return;
    if (role !== "admin" && role !== "manager" && role !== "assistant") return;
    setRoleLoading(true);
    setRoleError(null);
    let endpoint = "";
    if (role === "admin") endpoint = "/farmhouse/admin";
    if (role === "manager") endpoint = "/farmhouse/manager";
    if (role === "assistant") endpoint = "/farmhouse/assistant";
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(`${config.backendUrl}${endpoint}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch role farmhouses');
        return res.json();
      })
      .then((data) => {
        setRoleFarmhouses(Array.isArray(data.farmhouses) ? data.farmhouses : data);
      })
      .catch(() => setRoleError('Error fetching your farmhouses'))
      .finally(() => setRoleLoading(false));
  }, [role]);

  // Helper to fetch user details and cache them
  const fetchUserDetails = async (id: string) => {
    if (!id) return null;
    if (userCacheRef.current[id]) return userCacheRef.current[id];
    try {
      const res = await fetch(`${config.backendUrl}/auth/user/${id}`);
      if (!res.ok) return null;
      const user = await res.json();
      userCacheRef.current[id] = { name: user.name, _id: user._id };
      setUserCache((prev) => ({ ...prev, [id]: { name: user.name, _id: user._id } }));
      return { name: user.name, _id: user._id };
    } catch {
      return null;
    }
  };

  // On farmhouses load, fetch manager and assistant details
  useEffect(() => {
    if (!farmhouses.length) return;
    const ids = new Set<string>();
    farmhouses.forEach(fh => {
      if (fh.manager) ids.add(fh.manager);
      (fh.assistants || []).forEach(a => ids.add(a));
    });
    ids.forEach(id => {
      if (id && !userCacheRef.current[id]) fetchUserDetails(id);
    });
  }, [farmhouses]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        {role === "admin" && (
          <Link href="/farmhouse/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('add')}
            </Button>
          </Link>
        )}
      </div>
      {/* Super admin: view all farmhouses, no actions */}
      {role === "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle>{t('list')}</CardTitle>
            <CardDescription>{t('listDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin mr-2" /> {t('loading')}</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{t('error')}</div>
            ) : farmhouses.length === 0 ? (
              <div className="text-center py-8">{t('none')}</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('id')}</TableHead>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('managerName')}</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>{t('numberOfAssistants')}</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSuperFarmhouses.map((farmhouse) => (
                        <TableRow key={farmhouse._id || farmhouse.f_id}>
                          <TableCell>{farmhouse.f_id}</TableCell>
                          <TableCell>{farmhouse.name}</TableCell>
                          <TableCell>
                            {typeof farmhouse.manager === 'string' && farmhouse.manager && userCache[farmhouse.manager]?.name
                              ? `${userCache[farmhouse.manager].name} (${userCache[farmhouse.manager]._id})`
                              : typeof farmhouse.manager === 'string' && farmhouse.manager ? farmhouse.manager : "-"}
                          </TableCell>
                          <TableCell>
                            {typeof farmhouse.admin === 'string' && farmhouse.admin && userCache[farmhouse.admin]?.name
                              ? `${userCache[farmhouse.admin].name} (${userCache[farmhouse.admin]._id})`
                              : typeof farmhouse.admin === 'string' && farmhouse.admin ? farmhouse.admin : "-"}
                          </TableCell>
                          <TableCell>
                            {(farmhouse.assistants || []).map((aid, idx, arr) => {
                              if (typeof aid === 'string' && aid) {
                                const label = userCache[aid]?.name
                                  ? `${userCache[aid].name} (${userCache[aid]._id})`
                                  : aid;
                                return <span key={aid}>{label}{idx < arr.length - 1 ? <br /> : null}</span>;
                              }
                              return <span key={idx}>-</span>;
                            })}
                          </TableCell>
                          <TableCell>{farmhouse.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination controls for super_admin */}
                {superTotalPages > 1 && (
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => setSuperPage(superPage - 1)}
                      disabled={superPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="self-center text-sm mx-2">Page {superPage} of {superTotalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSuperPage(superPage + 1)}
                      disabled={superPage === superTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
      {/* Admin, manager, assistant: only view their farmhouses */}
      {(role === "admin" || role === "manager" || role === "assistant") && (
        <Card>
          <CardHeader>
            <CardTitle>
              {role === "admin" && t('adminTableTitle')}
              {role === "manager" && t('managerTableTitle')}
              {role === "assistant" && t('assistantTableTitle')}
            </CardTitle>
            <CardDescription>
              {role === "admin" && t('adminTableDescription')}
              {role === "manager" && t('managerTableDescription')}
              {role === "assistant" && t('assistantTableDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roleLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin mr-2" /> {t('roleLoading')}</div>
            ) : roleError ? (
              <div className="text-center text-red-600 py-8">{t('roleError')}</div>
            ) : roleFarmhouses.length === 0 ? (
              <div className="text-center py-8">{t('roleNone')}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('id')}</TableHead>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('managerName')}</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>{t('numberOfAssistants')}</TableHead>
                      <TableHead>Location</TableHead>
                      {role === "admin" && <TableHead>{t('actions')}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFarmhouses.map((farmhouse) => (
                      <TableRow key={farmhouse._id || farmhouse.f_id}>
                        <TableCell>{farmhouse.f_id}</TableCell>
                        <TableCell>{farmhouse.name}</TableCell>
                        <TableCell>
                          {typeof farmhouse.manager === 'string' && farmhouse.manager && userCache[farmhouse.manager]?.name
                            ? `${userCache[farmhouse.manager].name} (${userCache[farmhouse.manager]._id})`
                            : typeof farmhouse.manager === 'string' && farmhouse.manager ? farmhouse.manager : "-"}
                        </TableCell>
                        <TableCell>
                          {typeof farmhouse.admin === 'string' && farmhouse.admin && userCache[farmhouse.admin]?.name
                            ? `${userCache[farmhouse.admin].name} (${userCache[farmhouse.admin]._id})`
                            : typeof farmhouse.admin === 'string' && farmhouse.admin ? farmhouse.admin : "-"}
                        </TableCell>
                        <TableCell>
                          {(farmhouse.assistants || []).map(aid => {
                            if (typeof aid === 'string' && aid) {
                              return userCache[aid]?.name
                                ? `${userCache[aid].name} (${userCache[aid]._id})`
                                : aid;
                            }
                            return "-";
                          }).join(", ")}
                        </TableCell>
                        <TableCell>{farmhouse.location}</TableCell>
                        {role === "admin" && userId && farmhouse.admin === userId && (
                          <TableCell className="flex gap-2 items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(farmhouse)} aria-label="Edit">
                              <Edit className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(farmhouse._id || "")} disabled={deleteLoadingId === farmhouse._id} aria-label="Delete">
                              {deleteLoadingId === farmhouse._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Pagination controls for roleFarmhouses */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="self-center text-sm mx-2">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      {editId && (role === "super_admin" || role === "admin") && (
        <Card>
          <CardHeader>
            <CardTitle>{t('editTitle')}</CardTitle>
            <CardDescription>{t('update')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input name="f_id" placeholder="ID" value={editForm.f_id} onChange={e => handleEditFormChange('f_id', e.target.value)} required />
                <Input name="name" placeholder="Name" value={editForm.name} onChange={e => handleEditFormChange('name', e.target.value)} required />
                <UserAutocomplete
                  options={managerOptions}
                  value={editForm.manager}
                  onChange={v => handleEditFormChange('manager', v as UserOption)}
                  multi={false}
                  required
                  placeholder="Search manager by name, email, or ID..."
                />
                <UserAutocomplete
                  options={assistantOptions}
                  value={editForm.assistants}
                  onChange={v => handleEditFormChange('assistants', v as UserOption[])}
                  multi
                  required={false}
                  placeholder="Search assistants by name, email, or ID..."
                />
                <Input name="location" placeholder="Location" value={editForm.location} onChange={e => handleEditFormChange('location', e.target.value)} />
              </div>
              <Button type="submit" disabled={editLoading}>{editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('update')}</Button>
              <Button type="button" variant="ghost" className="ml-2" onClick={() => setEditId(null)}>{t('cancel')}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 