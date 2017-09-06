using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Assessment.Models.AccountViewModels;

namespace Assessment.Models
{
    public class HistoryContext : DbContext
    {
        public HistoryContext (DbContextOptions<HistoryContext> options)
            : base(options)
        {
        }

		public DbSet<Assessment.Models.AccountViewModels.QueryViewModel> Queries { get; set; }
    }
}
