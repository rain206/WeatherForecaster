using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Assessment.Models;
using Assessment.Models.AccountViewModels;
using Microsoft.AspNetCore.Authorization;

namespace Assessment.Controllers
{
    public class HistoryController : Controller
    {
        private readonly HistoryContext _context;

        public HistoryController(HistoryContext context)
        {
            _context = context;    
        }

		/// <summary>
		/// Gets the user's search History
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		[Authorize]
        public async Task<IActionResult> Index(int userId)
        {

			//Gets a list of Query IDs
			var userHistory = from h in _context.Queries
							  where h.Id == userId
							  select h.Query;

			var model = new History();
			model.QueryList = await userHistory.ToListAsync();

            return View(model);
        }

		/// <summary>
		/// Adds a new Query to the database
		/// </summary>
		/// <param name="model"></param>
		[Authorize]
		public async void CreateQuery (string query, int userId)
		{
			var model = new QueryViewModel();
			model.Query = query;
			model.UserId = userId;
			_context.Add(model);
			await _context.SaveChangesAsync();
		}


        private bool HistoryViewModelExists(int id)
        {
            return _context.Queries.Any(e => e.Id == id);
        }
    }
}
