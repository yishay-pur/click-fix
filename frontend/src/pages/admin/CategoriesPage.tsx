import { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, Button, Input, Modal, PageLoader } from '../../components/common';
import { classNames } from '../../utils/helpers';
import { adminService, AdminCategory } from '../../services/admin.service';
import { toast } from 'react-toastify';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await adminService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('שגיאה בטעינת הקטגוריות');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      description: category.description,
    });
    setShowModal(true);
  };

  const openDeleteModal = (category: AdminCategory) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsProcessing(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        toast.success('הקטגוריה עודכנה בהצלחה');
      } else {
        await adminService.createCategory(formData);
        toast.success('הקטגוריה נוספה בהצלחה');
      }

      // Refresh categories list
      const data = await adminService.getCategories();
      setCategories(data);

      setShowModal(false);
      setFormData({ name: '', icon: '', description: '' });
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('שגיאה בשמירת הקטגוריה');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsProcessing(true);
    try {
      await adminService.deleteCategory(categoryToDelete.id);
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      toast.success('הקטגוריה נמחקה בהצלחה');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('שגיאה במחיקת הקטגוריה');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">
            <Settings className="w-7 h-7 inline ml-2 text-primary-500" />
            ניהול קטגוריות
          </h1>
          <p className="text-secondary-600">
            הוספה, עריכה וארגון קטגוריות בעלי מקצוע
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-5 h-5" />
          הוסף קטגוריה
        </Button>
      </div>

      {/* Categories List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600 w-12"></th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">קטגוריה</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">תיאור</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">בעלי מקצוע</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">סטטוס</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-secondary-600">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className={classNames(
                    'hover:bg-secondary-50',
                    !category.isActive && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <button className="cursor-grab text-secondary-400 hover:text-secondary-600">
                      <GripVertical className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium text-secondary-800">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary-600">
                    {category.description}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {category.professionalsCount} בעלי מקצוע
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled
                      className={classNames(
                        'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors opacity-60 cursor-not-allowed',
                        category.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-secondary-100 text-secondary-600'
                      )}
                    >
                      {category.isActive ? (
                        <>
                          <Eye className="w-4 h-4" />
                          פעיל
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          מוסתר
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(category)}
                        disabled={category.professionalsCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 bg-secondary-50 border border-secondary-200">
        <div className="p-4 text-secondary-600 text-sm">
          <p className="font-medium text-secondary-800 mb-2">שימו לב</p>
          <p>
            תכונת הסתרת קטגוריות אינה נתמכת כרגע ב-API. ניתן עדיין לערוך ולמחוק קטגוריות קיימות.
          </p>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({ name: '', icon: '', description: '' });
          setEditingCategory(null);
        }}
        title={editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}
      >
        <div className="space-y-4">
          <Input
            label="שם הקטגוריה"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="לדוגמה: חשמלאי"
          />
          <Input
            label="אייקון (אימוג'י)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="לדוגמה: ⚡"
          />
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              תיאור
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 resize-none"
              placeholder="תיאור קצר של הקטגוריה..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              isLoading={isProcessing}
              disabled={!formData.name}
              fullWidth
            >
              {editingCategory ? 'שמור שינויים' : 'הוסף קטגוריה'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setFormData({ name: '', icon: '', description: '' });
                setEditingCategory(null);
              }}
            >
              ביטול
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        title="מחיקת קטגוריה"
      >
        {categoryToDelete && (
          <div className="space-y-4">
            <p className="text-secondary-600">
              האם אתה בטוח שברצונך למחוק את הקטגוריה{' '}
              <span className="font-medium text-secondary-800">
                {categoryToDelete.name}
              </span>
              ?
            </p>
            {categoryToDelete.professionalsCount > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                לא ניתן למחוק קטגוריה שיש בה בעלי מקצוע רשומים.
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isProcessing}
                disabled={categoryToDelete.professionalsCount > 0}
                fullWidth
              >
                מחק קטגוריה
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
              >
                ביטול
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
