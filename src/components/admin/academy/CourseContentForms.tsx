import { saveLesson, saveModule, saveResource } from "@/lib/academy/admin";
import type { AcademyLesson, AcademyModule, AcademyResource } from "@/types/academy";

const statuses = ["draft", "published", "archived"];
const resourceTypes = ["document", "pdf", "video", "link", "image", "other"];

export function ModuleForm({ courseId, module }: { courseId: string; module?: AcademyModule }) {
  return (
    <form action={saveModule} className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200 md:grid-cols-2">
      <input type="hidden" name="courseId" value={courseId} />
      {module ? <input type="hidden" name="id" value={module.id} /> : null}
      <input name="title" required defaultValue={module?.title ?? ""} placeholder="Titre du module" className="rounded-xl border p-3" />
      <input name="position" type="number" defaultValue={module?.position ?? 0} placeholder="Position" className="rounded-xl border p-3" />
      <select name="status" defaultValue={module?.status ?? "draft"} className="rounded-xl border p-3">
        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      <textarea name="description" defaultValue={module?.description ?? ""} placeholder="Description" className="min-h-28 rounded-xl border p-3 md:col-span-2" />
      <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white md:col-span-2">Sauvegarder le module</button>
    </form>
  );
}

export function LessonForm({ courseId, modules, lesson }: { courseId: string; modules: AcademyModule[]; lesson?: AcademyLesson }) {
  return (
    <form action={saveLesson} className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200 md:grid-cols-2">
      <input type="hidden" name="courseId" value={courseId} />
      {lesson ? <input type="hidden" name="id" value={lesson.id} /> : null}
      <input name="title" required defaultValue={lesson?.title ?? ""} placeholder="Titre de la leçon" className="rounded-xl border p-3" />
      <select name="moduleId" defaultValue={lesson?.module_id ?? ""} className="rounded-xl border p-3">
        <option value="">Sans module</option>
        {modules.map((module) => <option key={module.id} value={module.id}>{module.position}. {module.title}</option>)}
      </select>
      <input name="duration" defaultValue={lesson?.duration ?? ""} placeholder="Durée (ex. 12 min)" className="rounded-xl border p-3" />
      <input name="position" type="number" defaultValue={lesson?.position ?? 0} placeholder="Position" className="rounded-xl border p-3" />
      <input name="videoUrl" type="text" defaultValue={lesson?.video_url ?? ""} placeholder="https://customer-XXXX.cloudflarestream.com/VIDEO_ID/iframe" className="rounded-xl border p-3 md:col-span-2" />
      <p className="text-sm text-slate-500 md:col-span-2">Collez ici le lien de la vidéo. Pour Cloudflare Stream, utilisez l’URL iframe du lecteur, par exemple https://customer-XXXX.cloudflarestream.com/VIDEO_ID/iframe ou https://iframe.videodelivery.net/VIDEO_ID. Si un iframe complet est collé, seul son src sera enregistré.</p>
      <select name="status" defaultValue={lesson?.status ?? "draft"} className="rounded-xl border p-3">
        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      <label className="flex items-center gap-2 rounded-xl border p-3"><input name="isPreview" type="checkbox" defaultChecked={lesson?.is_preview ?? false} /> Leçon gratuite / aperçu</label>
      <textarea name="content" defaultValue={lesson?.content ?? ""} placeholder="Contenu écrit de la leçon" className="min-h-64 rounded-xl border p-3 md:col-span-2" />
      <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white md:col-span-2">Sauvegarder la leçon</button>
    </form>
  );
}

export function ResourceForm({ courseId, lessons, resource }: { courseId: string; lessons: AcademyLesson[]; resource?: AcademyResource }) {
  return (
    <form action={saveResource} className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200 md:grid-cols-2">
      <input type="hidden" name="courseId" value={courseId} />
      {resource ? <input type="hidden" name="id" value={resource.id} /> : null}
      <input name="title" required defaultValue={resource?.title ?? ""} placeholder="Titre de la ressource" className="rounded-xl border p-3" />
      <select name="lessonId" defaultValue={resource?.lesson_id ?? ""} className="rounded-xl border p-3"><option value="">Ressource globale du cours</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select>
      <select name="resourceType" defaultValue={resource?.resource_type ?? "document"} className="rounded-xl border p-3">{resourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
      <input name="position" type="number" defaultValue={resource?.position ?? 0} placeholder="Position" className="rounded-xl border p-3" />
      <input name="fileUrl" type="url" defaultValue={resource?.file_url ?? ""} placeholder="URL fichier" className="rounded-xl border p-3" />
      <input name="externalUrl" type="url" defaultValue={resource?.external_url ?? ""} placeholder="URL externe" className="rounded-xl border p-3" />
      <label className="flex items-center gap-2 rounded-xl border p-3"><input name="isDownloadable" type="checkbox" defaultChecked={resource?.is_downloadable ?? true} /> Téléchargeable</label>
      <textarea name="description" defaultValue={resource?.description ?? ""} placeholder="Description" className="min-h-28 rounded-xl border p-3 md:col-span-2" />
      <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white md:col-span-2">Sauvegarder la ressource</button>
    </form>
  );
}
